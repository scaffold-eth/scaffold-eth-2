//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract YourContract {

    // State Variables
    address public immutable owner;
    string public purpose = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public price = 0.001 ether;
    uint256 public totalCounter = 0;
    mapping(address => string) public addressToPurpose;

    // Events
    event PurposeChange(address purposeSetter, string newPurpose, bool premium, uint256 value);

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: Can be applied to functions.
    // Check the withdraw() function
    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    function setPurpose(string memory _newPurpose) public {
        // Change state variables
        purpose = _newPurpose;
        addressToPurpose[msg.sender] = _newPurpose;
        totalCounter += 1;
        premium = false;

        emit PurposeChange(msg.sender, _newPurpose, false, 0);
    }

    function setPurposePremium(string memory _newPurpose) public payable {
        require(msg.value >= price, "Not enough ETH provided");

        // Change state variables
        addressToPurpose[msg.sender] = _newPurpose;
        purpose = _newPurpose;
        totalCounter += 1;
        premium = true;

        // Increment price 1%
        price = price * 101 / 100;

        emit PurposeChange(msg.sender, _newPurpose, true, msg.value);
    }

    function withdraw() isOwner public {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    // Allow directly receiving ETH by default.
    receive() external payable {}
}
