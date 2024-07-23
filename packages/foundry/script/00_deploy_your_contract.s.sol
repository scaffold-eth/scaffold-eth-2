//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";

contract DeployYourContract is ScaffoldETHDeploy {
  function run() external {
    uint256 deployerPrivateKey = setupLocalhostEnv();
    vm.startBroadcast(deployerPrivateKey);

    YourContract yourContract = new YourContract(vm.addr(deployerPrivateKey));
    console.logString(
      string.concat(
        "YourContract deployed at: ", vm.toString(address(yourContract))
      )
    );

    vm.stopBroadcast();
  }
}
