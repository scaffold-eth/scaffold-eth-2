// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CarbonCreditManagement {
    mapping(address => uint256) public carbonCredits;

    function issueCredits(address to, uint256 amount) public {
        carbonCredits[to] += amount;
    }

    function retireCredits(address from, uint256 amount) public returns (bool) {
        require(carbonCredits[from] >= amount, "Insufficient credits");
        carbonCredits[from] -= amount;
        return true;
    }
}
