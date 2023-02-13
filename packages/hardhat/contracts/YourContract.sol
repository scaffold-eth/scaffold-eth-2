pragma solidity >=0.8.0 <0.9.0;

//SPDX-License-Identifier: MIT

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {
  address public immutable owner;
  string[2] public purpose = ["Building Unstoppable Apps!!!", "hello world"];
  uint256[2] public numArray = [1, 2];
  bool[2] public boolArray = [true, false];

  constructor(address _owner) payable {
    // what should we do on deploy?
    owner = _owner;
  }

  function setPurpose(string[2] memory newPurpose) public payable {
    purpose = newPurpose;
  }

  function setNumArray(uint[2] memory newNumArray) public payable {
    numArray = newNumArray;
  }

  function setBoolArray(bool[2] memory newBoolArray) public payable {
    boolArray = newBoolArray;
  }

  // to support receiving ETH by default
  receive() external payable {}

  fallback() external payable {}
}
