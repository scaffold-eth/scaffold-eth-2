// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A capped ERC-20 token with owner-only minting.
 * Max supply: 1,000,000 GOLD (with 18 decimals).
 */
contract GoldToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;

    event TokensMinted(address indexed to, uint256 amount);

    constructor(address initialOwner) ERC20("GoldToken", "GOLD") Ownable(initialOwner) {}

    /**
     * Mint new tokens. Only the owner can call this.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint (in wei units, i.e. 18 decimals).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "GoldToken: cap exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
