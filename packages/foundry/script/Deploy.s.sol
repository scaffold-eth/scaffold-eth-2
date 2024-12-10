//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
// import { DeploySolution2 } from "./DeploySolution2.s.sol";

/**
 * @notice Main deployment script for all solutions
 * @dev Run this when you want to deploy multiple solutions at once
 *
 * Example: yarn foundry:deploy  # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all solutions sequentially
        // Add new solution deployments here when needed

        // Deploy Solution 2
        // DeploySolution2 deploySolution2 = new DeploySolution2();
        // deploySolution2.run();

        // Deploy Solution 3
        // DeploySolution3 deploySolution3 = new DeploySolution3();
        // deploySolution3.run();
    }
}
