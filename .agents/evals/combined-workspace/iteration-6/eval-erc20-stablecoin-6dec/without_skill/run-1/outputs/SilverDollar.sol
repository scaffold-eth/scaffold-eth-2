// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * SilverDollar (SLVR) - A stablecoin token with 6 decimals, capped supply,
 * gasless approvals via ERC20Permit, and owner-only minting.
 */
contract SilverDollar is ERC20, ERC20Permit, Ownable {
    uint8 private constant _DECIMALS = 6;
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** _DECIMALS;

    event Minted(address indexed to, uint256 amount);

    constructor(address initialOwner) ERC20("SilverDollar", "SLVR") ERC20Permit("SilverDollar") Ownable(initialOwner) {}

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * Mint new tokens. Only the owner can call this function.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint (in smallest unit, i.e. with 6 decimal places).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "SilverDollar: cap exceeded");
        _mint(to, amount);
        emit Minted(to, amount);
    }
}
