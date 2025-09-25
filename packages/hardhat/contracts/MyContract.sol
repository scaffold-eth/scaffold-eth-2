// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.5 <0.9.0;
pragma abicoder v2;

contract MyContract {
	// State Variables
	address public immutable owner;
	string public greeting = "Building Unstoppable Apps!!!";
	bool public premium = false;
	uint256 public totalCounter = 0;
	mapping(address => uint) public userGreetingCounter;

	struct NestedStruct {
		uint a;
		SimpleStruct[][][] b;
	}
	struct SimpleStruct {
		uint x;
		uint y;
	}

	// State variables
	NestedStruct public sData;
	SimpleStruct public tData;
	uint public valueData;

	// Events: a way to emit log statements from smart contract that can be listened to by external parties
	event GreetingChange(
		address indexed greetingSetter,
		string newGreeting,
		bool premium,
		uint256 value
	);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address _owner) {
		owner = _owner;
	}

	/**
	 * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
	 *
	 * @param _newGreeting (string memory) - new greeting to save on the contract
	 */
	function setGreeting(string memory _newGreeting) public payable {
		// Change state variables
		greeting = _newGreeting;
		totalCounter += 1;
		userGreetingCounter[msg.sender] += 1;

		// msg.value: built-in global variable that represents the amount of ether sent with the transaction
		if (msg.value > 0) {
			premium = true;
		} else {
			premium = false;
		}

		// emit: keyword used to trigger an event
		emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, 0);
	}

	// Function to update the data
	function updateData(NestedStruct calldata _nestedStruct) public payable {
		// Update state variables
		sData = _nestedStruct; // Assigns the entire struct. For dynamic arrays, you might need more complex logic.
	}

	// Read function which accepts _nestedStruct
	function totalPassedStruct(
		NestedStruct calldata _nestedStruct
	) public pure returns (uint totalA, uint totalX, uint totalY) {
		totalA = _nestedStruct.a;
		uint totalXSum = 0;
		uint totalYSum = 0;

		for (uint i = 0; i < _nestedStruct.b.length; i++) {
			for (uint j = 0; j < _nestedStruct.b[i].length; j++) {
				for (uint k = 0; k < _nestedStruct.b[i][j].length; k++) {
					totalXSum += _nestedStruct.b[i][j][k].x;
					totalYSum += _nestedStruct.b[i][j][k].y;
				}
			}
		}

		return (totalA, totalXSum, totalYSum);
	}

	// Function to get the current datahe current data
	function geAllSData() public view returns (NestedStruct memory) {
		return (sData);
	}
}