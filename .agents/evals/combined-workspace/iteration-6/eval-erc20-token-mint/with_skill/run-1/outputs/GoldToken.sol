// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * An ERC-20 token with a capped supply of 1 million tokens.
 * Only the owner can mint new tokens.
 */
contract GoldToken is ERC20Capped, Ownable {
    constructor(address _owner)
        ERC20("GoldToken", "GOLD")
        ERC20Capped(1_000_000 * 10 ** 18)
        Ownable(_owner)
    {}

    /**
     * Mint new GOLD tokens. Only callable by the contract owner.
     * @param to The address to receive the minted tokens
     * @param amount The amount of tokens to mint (in wei units, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Required override because both ERC20 and ERC20Capped define _update
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
