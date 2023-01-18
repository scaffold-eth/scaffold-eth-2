//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * A smart contract that allows setting a purpose of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {

    // State Variables
    address public immutable owner;
    string public purpose = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint) public userPurposeCounter;

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
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Function that allows anyone to change the purpose of the contract and increase the counters
     *
     * @param _newPurpose (string memory) - new purpose of the contract
     */
    function setPurpose(string memory _newPurpose) public payable {
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

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() isOwner public {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows for receiving of ETH
     */
    receive() external payable {}
}
