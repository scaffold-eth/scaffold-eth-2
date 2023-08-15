//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";
import "../contracts/YourContract.sol";

contract VerifyAll is Script {
    uint96 currTransactionIdx;

    function run() external {
        string memory root = vm.projectRoot();
        string memory path = string.concat(
            root,
            "/broadcast/Deploy.s.sol/",
            vm.toString(block.chainid),
            "/run-latest.json"
        );
        string memory content = vm.readFile(path);

        while (this.nextTransaction(content)) {
            _verifyIfContractDeployment(content);
            currTransactionIdx++;
        }
    }

    function _verifyIfContractDeployment(string memory content) internal {
        string memory txType = abi.decode(
            vm.parseJson(
                content,
                searchStr(currTransactionIdx, "transactionType")
            ),
            (string)
        );
        if (keccak256(bytes(txType)) == keccak256(bytes("CREATE"))) {
            _verifyContract(content);
        }
    }

    function _verifyContract(string memory content) internal {
        string memory contractName = abi.decode(
            vm.parseJson(
                content,
                searchStr(currTransactionIdx, "contractName")
            ),
            (string)
        );
        address contractAddr = abi.decode(
            vm.parseJson(
                content,
                searchStr(currTransactionIdx, "contractAddress")
            ),
            (address)
        );
        bytes32[] memory arguments = abi.decode(
            vm.parseJson(content, searchStr(currTransactionIdx, "arguments")),
            (bytes32[])
        );

        console.logUint(arguments.length);

        // string[] memory castInputs = new string[](5);
        // castInputs[0] = ("cast");
        // castInputs[1] = ("abi-encode");
        // castInputs[2] = ("constructor(address,uint256)");
        // castInputs[3] = ("0xDe3089d40F3491De794fBb1ECA109fAc36F889d0");
        // castInputs[4] = ("15");
        // bytes memory castArgs = vm.ffi(castInputs);
        // console.logBytes(castArgs);

        // bytes memory argsBytes = _getArgsBytesFromContract(
        //     contractName,
        //     arguments
        // );

        // console.logBytes(argsBytes);

        // string[] memory Verifyinputs = new string[](9);
        // Verifyinputs[0] = "forge";
        // Verifyinputs[1] = "verify-contract";
        // Verifyinputs[2] = vm.toString(contractAddr);
        // Verifyinputs[3] = contractName;
        // Verifyinputs[4] = "--chain";
        // Verifyinputs[5] = vm.toString(block.chainid);
        // Verifyinputs[6] = "--constructor-args";
        // Verifyinputs[7] = argsBytes;
        // Verifyinputs[8] = "--watch";

        // bytes memory res = vm.ffi(Verifyinputs);

        // console.logString(string(res));
        // console.logString("\n");
        return;
    }

    function _getArgsBytesFromContract(
        string memory contractName,
        string[] memory args
    ) internal returns (bytes memory) {
        string memory path = string.concat(
            vm.projectRoot(),
            "/out/",
            contractName,
            ".sol/",
            contractName,
            ".json"
        );
        string memory abiContent = vm.readFile(path);
        uint96 searchIdx = 0;
        string memory constructorStr = "constructor(";
        while (this.nextInput(abiContent, searchIdx)) {
            if (searchIdx != 0)
                constructorStr = string.concat(constructorStr, ",");
            constructorStr = string.concat(
                constructorStr,
                this.getInputFromRaw(abiContent, searchIdx)
            );
            searchIdx++;
        }
        constructorStr = string.concat(constructorStr, ")");
        string[] memory castInputs = new string[](args.length + 3);
        castInputs[0] = "cast";
        castInputs[1] = "abi-encode";
        castInputs[2] = constructorStr;
        for (uint96 i = 0; i < args.length; i++) {
            castInputs[i + 3] = args[i];
        }
        return vm.ffi(castInputs);
    }

    function nextInput(
        string memory content,
        uint96 idx
    ) external returns (bool) {
        try this.getInputFromRaw(content, idx) {
            return true;
        } catch {
            return false;
        }
    }

    function nextTransaction(string memory content) external returns (bool) {
        try this.getTransactionFromRaw(content, currTransactionIdx) {
            return true;
        } catch {
            return false;
        }
    }

    function getInputFromRaw(
        string memory content,
        uint96 idx
    ) external view returns (string memory) {
        string memory search = string.concat(
            ".abi[0].inputs[",
            vm.toString(idx),
            "].type"
        );
        return abi.decode(vm.parseJson(content, search), (string));
    }

    function getTransactionFromRaw(
        string memory content,
        uint96 idx
    ) external view {
        bytes32 hash = abi.decode(
            vm.parseJson(content, searchStr(idx, "hash")),
            (bytes32)
        );
    }

    function searchStr(
        uint96 idx,
        string memory searchKey
    ) internal pure returns (string memory) {
        return
            string.concat(".transactions[", vm.toString(idx), "].", searchKey);
    }
}
