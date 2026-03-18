// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * SilverDollar (SLVR) - A stablecoin token with 6 decimals, capped supply,
 * gasless approvals via ERC20Permit, and owner-only minting.
 */
contract SilverDollar is ERC20, ERC20Capped, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 6; // 10 million tokens with 6 decimals

    event TokensMinted(address indexed to, uint256 amount);

    constructor(
        address initialOwner
    ) ERC20("SilverDollar", "SLVR") ERC20Capped(MAX_SUPPLY) ERC20Permit("SilverDollar") Ownable(initialOwner) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * Mint new SLVR tokens. Only callable by the contract owner.
     * @param to The address to receive the minted tokens
     * @param amount The amount to mint (in smallest unit, i.e. 1 SLVR = 1e6)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // Required override for ERC20Capped to enforce the supply cap during minting
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
