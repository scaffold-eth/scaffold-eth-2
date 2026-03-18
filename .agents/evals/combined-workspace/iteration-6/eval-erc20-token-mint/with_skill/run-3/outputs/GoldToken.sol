// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A capped ERC-20 token where only the owner can mint new tokens.
 * Maximum supply is 1,000,000 GOLD (with 18 decimals).
 */
contract GoldToken is ERC20Capped, Ownable {
    constructor(address initialOwner)
        ERC20("GoldToken", "GOLD")
        ERC20Capped(1_000_000 * 10 ** 18)
        Ownable(initialOwner)
    {}

    /**
     * Mint new GOLD tokens. Only the contract owner can call this.
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint (in wei units, i.e. 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Required override because both ERC20 and ERC20Capped define _update
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
