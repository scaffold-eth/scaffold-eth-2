// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract TimelockedAdminTarget is Ownable {
    uint256 public constant MAX_FEE_BPS = 1_000;

    address public treasury;
    uint256 public feeBps;
    bool public featureEnabled;

    error FeeBpsTooHigh(uint256 requestedFeeBps, uint256 maxFeeBps);
    error InvalidTreasury(address treasuryAddress);

    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event FeeBpsUpdated(uint256 previousFeeBps, uint256 newFeeBps);
    event FeatureEnabledUpdated(bool previousValue, bool newValue);

    constructor(
        address initialOwner,
        address initialTreasury,
        uint256 initialFeeBps,
        bool initialFeatureEnabled
    ) Ownable(initialOwner) {
        if (initialTreasury == address(0)) {
            revert InvalidTreasury(address(0));
        }
        if (initialFeeBps > MAX_FEE_BPS) {
            revert FeeBpsTooHigh(initialFeeBps, MAX_FEE_BPS);
        }

        treasury = initialTreasury;
        feeBps = initialFeeBps;
        featureEnabled = initialFeatureEnabled;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) {
            revert InvalidTreasury(address(0));
        }

        address previousTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previousTreasury, newTreasury);
    }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) {
            revert FeeBpsTooHigh(newFeeBps, MAX_FEE_BPS);
        }

        uint256 previousFeeBps = feeBps;
        feeBps = newFeeBps;
        emit FeeBpsUpdated(previousFeeBps, newFeeBps);
    }

    function setFeatureEnabled(bool newFeatureEnabled) external onlyOwner {
        bool previousValue = featureEnabled;
        featureEnabled = newFeatureEnabled;
        emit FeatureEnabledUpdated(previousValue, newFeatureEnabled);
    }
}
