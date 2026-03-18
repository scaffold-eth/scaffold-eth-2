// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * An ERC-20 token with a capped supply of 1 million tokens.
 * Only the owner can mint new tokens.
 */
contract GoldToken is ERC20Capped, Ownable {
    constructor(address initialOwner)
        ERC20("GoldToken", "GOLD")
        ERC20Capped(1_000_000 * 10 ** 18)
        Ownable(initialOwner)
    {}

    /**
     * Mint new GOLD tokens. Only callable by the owner.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint (in wei units).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
