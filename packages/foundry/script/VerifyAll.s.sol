//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";

contract VerifyAll is Script {
    uint96 currTransactionIdx;

    function run() external {
        string memory root = vm.projectRoot();
        string memory path = string.concat(
            root,
            "/broadcast/Deploy.s.sol/80001/run-latest.json"
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
        string memory args;
        for (uint i = 0; i < arguments.length; i++) {
            args = string.concat(args, vm.toString(arguments[i]));
        }
        string[] memory inputs = new string[](18);
        inputs[0] = "forge";
        inputs[1] = "verify-contract";
        inputs[2] = vm.toString(contractAddr);
        inputs[3] = contractName;
        inputs[4] = "--chain";
        inputs[5] = vm.toString(block.chainid);
        inputs[6] = "--constructor-args";
        inputs[7] = args;
        inputs[8] = "--watch 2>&1 >/dev/null";
        // inputs[9] = "2>&1";
        // inputs[10] = ">/dev/null";
        inputs[9] = "|";
        inputs[10] = "grep";
        inputs[11] = "-E";
        inputs[12] = "-q";
        inputs[13] = "'already verified|Pass'";
        inputs[14] = "&&";
        inputs[15] = "echo";
        inputs[16] = "-n";
        inputs[
            17
        ] = "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002676d000000000000000000000000000000000000000000000000000000000000";

        bytes memory res = vm.ffi(inputs);
        // string memory output = abi.decode(res, (string));

        // if (keccak256(bytes(output)) != keccak256(bytes("SUCCESS"))) {
        //     string memory errMsg = string.concat(
        //         "Failed to verify contract ",
        //         contractName,
        //         " at address ",
        //         vm.toString(contractAddr)
        //     );
        //     console.logString(errMsg);
        //     return;
        // }
        // string memory resultMsg = string.concat(
        //     "Successfully verified contract ",
        //     contractName,
        //     " at address ",
        //     vm.toString(contractAddr)
        // );
        // console.logString(resultMsg);
        // return;
    }

    function nextTransaction(string memory content) external returns (bool) {
        try this.getTransactionFromRaw(content, currTransactionIdx) {
            return true;
        } catch {
            return false;
        }
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
