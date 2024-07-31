//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";
import { DeployYourContract } from "./00_deploy_your_contract.s.sol";

contract DeployScript is ScaffoldETHDeploy {
  uint256 deployerPrivateKey;

  error InvalidPrivateKey(string);

  constructor() {
    deployerPrivateKey = setupLocalhostEnv();
  }

  function run() external ScaffoldEthDeployerRunner {
    DeployYourContract deployYourContract = new DeployYourContract();
    deployYourContract.run();
  }

  modifier ScaffoldEthDeployerRunner() {
    if (deployerPrivateKey == 0) {
      revert InvalidPrivateKey(
        "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
      );
    }
    _;
    exportDeployments();
  }
}
