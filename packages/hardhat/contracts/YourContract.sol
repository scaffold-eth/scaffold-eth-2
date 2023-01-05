//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract YourContract {

    // State Variables
    address public immutable owner;
    string public purpose = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint) public userPurposeCounter;

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

    function setPurpose(string memory _newPurpose) public payable {
        // Change state variables
        purpose = _newPurpose;
        totalCounter += 1;
        userPurposeCounter[msg.sender] += 1;

        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        emit PurposeChange(msg.sender, _newPurpose, msg.value > 0, 0);
    }

     function withdraw() isOwner public {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    // Allow directly receiving ETH by default.
    receive() external payable {}
}
