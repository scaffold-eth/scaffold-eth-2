//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";

contract DeployYourContract is ScaffoldETHDeploy {
  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    YourContract yourContract = new YourContract(deployer);
    console.logString(
      string.concat(
        "YourContract deployed at: ", vm.toString(address(yourContract))
      )
    );
  }
}
