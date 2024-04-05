// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/Structs.sol";

contract EASOnboardingStorage {
    address deployer;

    mapping(address => Structs.AttestationProfile) public attestationProfile;
    mapping(uint256 => Structs.Event) public events;
    mapping(address => mapping(uint256 => Structs.Event)) public studentEventMap;
    mapping(address => bool) isMentor;
    uint256 public eventIdCounter = 1;
}
