// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.5 <0.9.0;
pragma abicoder v2;

contract YourContract {
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

	// Function to update the data
	function updateData(NestedStruct calldata _nestedStruct) public {
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
