// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Structs {
    struct Event {
        uint256 eventId;
        uint256 closingTimestamp;
        uint256 attendeeCount;
        string eventName;
        string eventDescription;
        string mentorName;
        address mentorAddress;
        address[] attendees;
        bool isActive;
        bool overrideClosingTimestamp;
    }

    struct AttestationProfile {
        uint256 studentLevel;
        uint256 eventsCompleted;
        bytes32[] attestations;
    }
}
