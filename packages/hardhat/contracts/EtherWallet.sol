// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract EtherWallet {
	address payable public owner;
	string public greeting = "Ether Wallet!!!";

	constructor() {
		owner = payable(msg.sender);
	}

	modifier OnlyOwner() {
		require(msg.sender == owner, "Not the Owner");
		_;
	}

	receive() external payable {}

	function withdraw(uint256 _amount) external {
		require(msg.sender == owner, "caller is not owner");
		payable(msg.sender).transfer(_amount);
	}

	function getBalance() external view returns (uint256) {
		return address(this).balance;
	}

	function setNewOwner(address _newOwner) external OnlyOwner {
		owner = payable(_newOwner);
	}
}
