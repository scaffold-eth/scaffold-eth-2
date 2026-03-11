// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * A simple ERC20 token used to demonstrate EIP-5792 batch transactions.
 * The deployer receives an initial supply of tokens.
 */
contract BatchToken is ERC20 {
    constructor(address _initialOwner, uint256 _initialSupply) ERC20("BatchToken", "BATCH") {
        _mint(_initialOwner, _initialSupply);
    }
}
