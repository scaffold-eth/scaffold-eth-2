//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { YourContract } from "../contracts/YourContract.sol";
import { ScaffoldETHDeploy, console } from "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
  error InvalidPrivateKey(string);

  function run() external {
    address deployer = _startBroadcast();
    YourContract yourContract = new YourContract(deployer);
    console.logString(
      string.concat(
        "YourContract deployed at: ", vm.toString(address(yourContract))
      )
    );
    _stopBroadcast();

    /**
     * This function generates the file containing the contracts Abi definitions.
     * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
     * This function should be called last.
     */
    exportDeployments();
  }

  function test() public { }
}
