// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SendEther {
	string public greeting = "Greetings from SendEther!!!";

	function sendEtherViaCall(address payable _to) public payable {
		// Call returns a boolean value indicating success or failure.
		// This is the current recommended method to use.
		(bool sent, ) = _to.call{ value: msg.value }("");
		require(sent, "Failed to send Ether");
	}
}
