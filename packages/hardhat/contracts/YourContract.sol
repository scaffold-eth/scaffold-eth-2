pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract YourContract {
  event SetPurpose(address sender, string purpose);

  string public purpose = "Building Unstoppable Apps!!!";
  uint256 public totalSupply = 2.5 ether;
  mapping(address => uint256) public counter;
  bytes32 public myBytes;

  constructor() payable {
    // what should we do on deploy?
  }

  function setPurpose(string memory newPurpose) public {
    purpose = newPurpose;
    console.log(msg.sender, "set purpose to", purpose);
    emit SetPurpose(msg.sender, purpose);
  }

  function withAddressAndAndValueIncrementCounter(address _add) public payable {
    require(msg.value > 0.0001 ether, "Not enough");
    counter[_add] += 1;
  }

  function withUint8AndBytes(uint8 _u, bytes32 _b) public {
    counter[msg.sender] = _u;
    myBytes = _b;
  }

  function counterPlusX(address _add, uint256 _x) public returns (uint256) {
    return counter[_add] + _x;
  }

  // to support receiving ETH by default
  receive() external payable {}

  fallback() external payable {}
}
