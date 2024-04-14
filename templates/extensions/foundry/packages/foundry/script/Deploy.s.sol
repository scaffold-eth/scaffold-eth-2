//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        address owner;

        if (msg.sender == 0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38) {
            uint256 deployerPrivateKey = setupLocalhostEnv();
            if (deployerPrivateKey == 0) {
                revert InvalidPrivateKey(
                    "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
                );
            }

            owner = vm.addr(deployerPrivateKey);
            vm.startBroadcast(deployerPrivateKey);
        } else {
            owner = msg.sender;
            vm.startBroadcast();
        }

        YourContract yourContract = new YourContract(owner);
        console.logString(
            string.concat(
                "YourContract deployed at: ", vm.toString(address(yourContract))
            )
        );
        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function test() public {}
}
