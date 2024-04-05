// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./lib/Structs.sol";
import "./storage/EASOnboardingStorage.sol";

contract EASOnboarding is EASOnboardingStorage {
    constructor() {
        deployer = msg.sender;
    }

    modifier isMentorAddress(address _mentorAddress) {
        require(
            isMentor[_mentorAddress] || _mentorAddress == deployer, "Only selected mentor addresses can create quiz"
        );
        _;
    }

    // Function to get attested, with checks and storing attestation data
    function getAttested(uint256 _eventId, uint256 _level, bytes32 _msgHash, bytes memory _signature)
        public
        returns (bool)
    {
        require(isVerified(_msgHash, _signature), "Invalid Txn Source");
        require(events[_eventId].isActive || !events[_eventId].overrideClosingTimestamp, "Event is no longer active");
        require(
            (events[_eventId].closingTimestamp > block.timestamp) || !events[_eventId].overrideClosingTimestamp,
            "Event is past closing timestamp"
        );

        events[_eventId].attendees.push(msg.sender);
        attestationProfile[msg.sender].eventsCompleted++;
        attestationProfile[msg.sender].studentLevel = _level;
        studentEventMap[msg.sender][_eventId] = true;
        return true;
    }

    function addAttestation(bytes32 _attestation, address _studentAddress) public {
        require(msg.sender == deployer);
        attestationProfile[_studentAddress].attestations.push(_attestation);
    }

    function toggleOverrideEventFlag(uint256 _eventId, bool _res) public isMentorAddress(msg.sender) {
        events[_eventId].overrideClosingTimestamp = _res;
    }

    function createEvent(
        uint256 _closingTimestamp,
        string memory _eventName,
        string memory _eventDescription,
        string memory _mentorName
    ) public isMentorAddress(msg.sender) {
        require(_closingTimestamp > block.timestamp, "Closing timestamp cannot be in the past.");

        events[eventIdCounter].eventId = eventIdCounter;
        events[eventIdCounter].closingTimestamp = _closingTimestamp;
        events[eventIdCounter].attendeeCount = 1;
        events[eventIdCounter].eventName = _eventName;
        events[eventIdCounter].eventDescription = _eventDescription;
        events[eventIdCounter].mentorName = _mentorName;
        events[eventIdCounter].mentorAddress = msg.sender;
        events[eventIdCounter].attendees.push(msg.sender);
        events[eventIdCounter].isActive = true;
        events[eventIdCounter].overrideClosingTimestamp = false;
        eventIdCounter++;
    }

    function isVerified(bytes32 _messageHash, bytes memory _signature) public view returns (bool) {
        // The ethSignedMessageHash is the hash that the signer actually signed
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(_messageHash);

        // Recover the signer's address from the signature
        address signer = recoverSigner(ethSignedMessageHash, _signature);

        require(signer == deployer, "Unauthorized Contract call");

        return true;
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }
}
