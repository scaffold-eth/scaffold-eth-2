// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title BatchToken
 * @notice A simple ERC20 token used to demonstrate EIP-5792 batch transactions.
 * The deployer receives an initial supply of tokens. Users can then use
 * wallet_sendCalls (EIP-5792) to approve and transferFrom in a single batch.
 */
contract BatchToken is ERC20 {
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address recipient
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
        _mint(recipient, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
