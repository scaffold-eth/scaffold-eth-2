// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CircleUSDC is ERC20, ERC20Burnable, Ownable {
  constructor(address _owner) ERC20("Circle USDC", "USDC") {
    transferOwnership(_owner);
    _mint(msg.sender, 100000 * 10 ** decimals());
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }
}
