// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { TimelockController as OpenZeppelinTimelockController } from "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimelockController is OpenZeppelinTimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) OpenZeppelinTimelockController(minDelay, proposers, executors, admin) {}
}
