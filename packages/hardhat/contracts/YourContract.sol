//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * YourContract - A smart contract that allows setting a purpose of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {

    // State Variables
    address public immutable owner; // The address of the owner of the contract
    string public purpose = "Building Unstoppable Apps!!!"; // The purpose of the contract
    bool public premium = false; // whether or not the contract is premium
    uint256 public totalCounter = 0; // A counter for the total number of times the purpose has been changed
    mapping(address => uint) public userPurposeCounter; // A mapping of addresses to the number of times the purpose has been set by that address

    // Events
    event PurposeChange(address purposeSetter, string newPurpose, bool premium, uint256 value); // Triggered when the purpose of the contract is changed

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: Can be applied to functions.
    // Check the withdraw() function
    modifier isOwner() {
        /**
         * Check if the msg.sender is the owner of the contract, if not, revert the function and
         * include the error message "Not the Owner"
         */
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * setPurpose - Function that allows anyone to change the purpose of the contract and increase the counters
     *
     * @param _newPurpose (string memory) - new purpose of the contract
     */
    function setPurpose(string memory _newPurpose) public payable {
        // Change the purpose of the contract
        purpose = _newPurpose;
        // Increase the total counter
        totalCounter += 1;
        // Increase the counter for the user who set the purpose
        userPurposeCounter[msg.sender] += 1;

        // Check if the user sent any value with the transaction
        if (msg.value > 0) {
            // If the user sent a value, set the contract to premium
            premium = true;
        } else {
            // If the user did not send a value, set the contract to non-premium
            premium = false;
        }

        // Emit an event to log the change in purpose
        emit PurposeChange(msg.sender, _newPurpose, msg.value > 0, 0);
    }

    /**
     * withdraw - Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() isOwner public {
        // Send all the ether in the contract to the owner
        (bool success,) = owner.call{value: address(this).balance}("");
        /**
         * Check if the call to send ether was successful, if not, revert the function and
         * include the error message "Failed to send Ether"
         */
        require(success, "Failed to send Ether");
    }

    /**
     * receive - Function that allows for receiving of ETH
     */
    receive() external payable {}
}
