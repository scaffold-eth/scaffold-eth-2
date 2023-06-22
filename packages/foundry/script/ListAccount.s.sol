//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";

contract ListAccount is Script {
    function run() external {
        uint256 privateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        if (privateKey == 0) {
            console.logString(
                "You don't have a deployer account. Run `yarn generate` first"
            );
        } else {
            address acc = vm.addr(privateKey);
            console.logString("------------------Account------------------");
            console.logString(vm.toString(vm.addr(privateKey)));
            console.logString("-------------------------------------------");
            console.logString("");

            Vm.Rpc[] memory availableRPCs = vm.rpcUrlStructs();
            for (uint256 i = 0; i < availableRPCs.length; i++) {
                Vm.Rpc memory rpc = availableRPCs[i];
                try vm.createSelectFork(rpc.url) returns (uint256) {
                    console.logString(string.concat("--- ", rpc.key, " ---"));
                    printAccountInfo(acc);
                } catch (bytes memory) {
                    console.logString(
                        string.concat("Cant connect to network : ", rpc.key)
                    );
                }
            }
        }
    }

    function printAccountInfo(address acc) internal view {
        string memory ln;
        ln = string.concat("    balance : ", vm.toString(acc.balance));
        console.logString(ln);
        ln = string.concat("    nonce : ", vm.toString(vm.getNonce(acc)));
        console.log(ln);
        console.logString("------");
    }
}
