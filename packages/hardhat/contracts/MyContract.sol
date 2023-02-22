//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract MyContract {
  uint public counter;

  function increaseCounter() public {
    counter += 1;
  }
}
