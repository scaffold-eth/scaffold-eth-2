//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";
import "solidity-bytes-utils/BytesLib.sol";

/**
 * @dev Temp Vm implementation
 * @notice calls the tryffi function on the Vm contract
 * @notice will be deleted once the forge/std is updated
 */
struct FfiResult {
    int32 exit_code;
    bytes stdout;
    bytes stderr;
}

interface tempVm {
    function tryFfi(string[] calldata) external returns (FfiResult memory);
}

contract VerifyAll is Script {
    uint96 currTransactionIdx;

    function run() external {
        string memory root = vm.projectRoot();
        string memory path =
            string.concat(root, "/broadcast/Deploy.s.sol/", vm.toString(block.chainid), "/run-latest.json");
        string memory content = vm.readFile(path);

        while (nextTransaction(content)) {
            _verifyIfContractDeployment(content);
            currTransactionIdx++;
        }
    }

    function _verifyIfContractDeployment(string memory content) internal {
        string memory txType =
            abi.decode(vm.parseJson(content, searchStr(currTransactionIdx, "transactionType")), (string));
        if (keccak256(bytes(txType)) == keccak256(bytes("CREATE"))) {
            _verifyContract(content);
        }
    }

    function _verifyContract(string memory content) internal {
        string memory contractName =
            abi.decode(vm.parseJson(content, searchStr(currTransactionIdx, "contractName")), (string));
        address contractAddr =
            abi.decode(vm.parseJson(content, searchStr(currTransactionIdx, "contractAddress")), (address));
        bytes memory deployedBytecode =
            abi.decode(vm.parseJson(content, searchStr(currTransactionIdx, "transaction.input")), (bytes));

        string memory artifactPath = _locateArtifact(contractName);
        string memory artifactJson = vm.readFile(artifactPath);

        // Read bytecode.object as a string. For contracts with external libraries, the hex
        // contains `__$<hash>$__` placeholders, which make `abi.decode(..., (bytes))` silently
        // fall back to string-encoding and report a bogus length. A placeholder and its resolved
        // address are both 20 bytes (40 hex chars), so char length is the source of truth.
        string memory bytecodeHex = _readBytecodeHex(artifactJson);
        uint256 compiledLen = _hexStringByteLength(bytecodeHex);

        bytes memory constructorArgs;
        if (deployedBytecode.length > compiledLen) {
            constructorArgs =
                BytesLib.slice(deployedBytecode, compiledLen, deployedBytecode.length - compiledLen);
        } else {
            constructorArgs = new bytes(0);
        }

        string[] memory libArgs = _discoverLibraries(artifactJson, bytecodeHex, content);

        uint256 argc = 9 + 2 * libArgs.length;
        string[] memory inputs = new string[](argc);
        inputs[0] = "forge";
        inputs[1] = "verify-contract";
        inputs[2] = vm.toString(contractAddr);
        inputs[3] = contractName;
        inputs[4] = "--chain";
        inputs[5] = vm.toString(block.chainid);
        inputs[6] = "--constructor-args";
        inputs[7] = vm.toString(constructorArgs);
        inputs[8] = "--watch";
        for (uint256 i = 0; i < libArgs.length; i++) {
            inputs[9 + 2 * i] = "--libraries";
            inputs[9 + 2 * i + 1] = libArgs[i];
        }

        FfiResult memory f = tempVm(address(vm)).tryFfi(inputs);

        if (f.stderr.length != 0) {
            console.logString(string.concat("Submitting verification for contract: ", vm.toString(contractAddr)));
            console.logString(string(f.stderr));
        } else {
            console.logString(string(f.stdout));
        }
        return;
    }

    function nextTransaction(string memory content) internal view returns (bool) {
        string memory hashPath = searchStr(currTransactionIdx, "hash");

        try vm.parseJson(content, hashPath) returns (bytes memory hashBytes) {
            if (hashBytes.length == 0) {
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    function _locateArtifact(string memory contractName) internal returns (string memory) {
        string memory root = vm.projectRoot();
        string memory defaultPath = string.concat(root, "/out/", contractName, ".sol/", contractName, ".json");

        try vm.readFile(defaultPath) returns (string memory) {
            return defaultPath;
        } catch {
            string[] memory inputs = new string[](3);
            inputs[0] = "bash";
            inputs[1] = "-c";
            inputs[2] = string.concat(
                "find '", root, "/out' -name '", contractName, ".json' -not -path '*/build-info/*' -print -quit | tr -d '\\n'"
            );
            FfiResult memory f = tempVm(address(vm)).tryFfi(inputs);
            return string(f.stdout);
        }
    }

    /// @dev Tries typed cheatcode first; falls back to generic parseJson + string decode.
    function _readBytecodeHex(string memory artifactJson) internal pure returns (string memory) {
        try vm.parseJsonString(artifactJson, ".bytecode.object") returns (string memory s) {
            return s;
        } catch {
            return abi.decode(vm.parseJson(artifactJson, ".bytecode.object"), (string));
        }
    }

    /// @dev Byte length of a "0x..."-prefixed hex string (char count / 2, minus "0x").
    function _hexStringByteLength(string memory hex_) internal pure returns (uint256) {
        bytes memory b = bytes(hex_);
        uint256 charLen = b.length;
        if (charLen >= 2 && b[0] == 0x30 && (b[1] == 0x78 || b[1] == 0x58)) {
            charLen -= 2;
        }
        return charLen / 2;
    }

    /// @dev Build `--libraries path:name:address` values for every external library the
    /// artifact links against. For each `linkReferences` key (the library source path) we
    /// scan the broadcast file; for each tx's `contractName` we compute the solc placeholder
    /// (`__$<keccak256(path:name)[0:17] as hex>$__`) and check whether it appears in the
    /// compiled bytecode. A hit identifies which broadcast deployment satisfies the link.
    function _discoverLibraries(
        string memory artifactJson,
        string memory bytecodeHex,
        string memory broadcastContent
    ) internal returns (string[] memory) {
        string[] memory libPaths;
        try vm.parseJsonKeys(artifactJson, ".bytecode.linkReferences") returns (string[] memory paths) {
            libPaths = paths;
        } catch {
            return new string[](0);
        }
        if (libPaths.length == 0) return new string[](0);

        string[] memory tmp = new string[](libPaths.length);
        uint256 count;

        for (uint256 p = 0; p < libPaths.length; p++) {
            (bool found, string memory libName, address addr) =
                _resolveLibrary(libPaths[p], bytecodeHex, broadcastContent);
            if (!found) continue;
            tmp[count++] = string.concat(libPaths[p], ":", libName, ":", vm.toString(addr));
        }

        string[] memory result = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tmp[i];
        }
        return result;
    }

    function _resolveLibrary(
        string memory libPath,
        string memory bytecodeHex,
        string memory broadcastContent
    ) internal returns (bool, string memory, address) {
        for (uint256 i = 0;; i++) {
            string memory nameKey = string.concat(".transactions[", vm.toString(i), "].contractName");
            bytes memory nameBytes;
            try vm.parseJson(broadcastContent, nameKey) returns (bytes memory b) {
                nameBytes = b;
            } catch {
                return (false, "", address(0));
            }
            if (nameBytes.length == 0) return (false, "", address(0));

            string memory candidate = abi.decode(nameBytes, (string));
            if (bytes(candidate).length == 0) continue;

            string memory placeholder = _computePlaceholder(libPath, candidate);
            if (_stringContains(bytecodeHex, placeholder)) {
                address addr = abi.decode(
                    vm.parseJson(
                        broadcastContent,
                        string.concat(".transactions[", vm.toString(i), "].contractAddress")
                    ),
                    (address)
                );
                return (true, candidate, addr);
            }
        }
    }

    /// @dev solc library placeholder: `__$<keccak256(path:name)[0:17] hex>$__` (40 chars = 20 bytes).
    function _computePlaceholder(string memory libPath, string memory libName)
        internal
        pure
        returns (string memory)
    {
        bytes32 h = keccak256(abi.encodePacked(libPath, ":", libName));
        bytes memory hexChars = "0123456789abcdef";
        bytes memory out = new bytes(40);
        out[0] = "_";
        out[1] = "_";
        out[2] = "$";
        for (uint256 i = 0; i < 17; i++) {
            uint8 bt = uint8(h[i]);
            out[3 + i * 2] = hexChars[bt >> 4];
            out[3 + i * 2 + 1] = hexChars[bt & 0x0f];
        }
        out[37] = "$";
        out[38] = "_";
        out[39] = "_";
        return string(out);
    }

    function _stringContains(string memory hay, string memory needle) internal pure returns (bool) {
        bytes memory h = bytes(hay);
        bytes memory n = bytes(needle);
        if (n.length == 0) return true;
        if (h.length < n.length) return false;
        for (uint256 i = 0; i <= h.length - n.length; i++) {
            bool matched = true;
            for (uint256 j = 0; j < n.length; j++) {
                if (h[i + j] != n[j]) {
                    matched = false;
                    break;
                }
            }
            if (matched) return true;
        }
        return false;
    }

    function searchStr(uint96 idx, string memory searchKey) internal pure returns (string memory) {
        return string.concat(".transactions[", vm.toString(idx), "].", searchKey);
    }
}
