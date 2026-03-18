// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A capped ERC-20 token with owner-restricted minting.
 * Maximum supply: 1,000,000 GOLD (with 18 decimals).
 * Only the contract owner can mint new tokens.
 */
contract GoldToken is ERC20Capped, Ownable {
    constructor(address _owner)
        ERC20("GoldToken", "GOLD")
        ERC20Capped(1_000_000 * 10 ** 18)
        Ownable(_owner)
    {}

    /**
     * Mint new GOLD tokens. Restricted to the contract owner.
     * Will revert if minting would exceed the 1,000,000 cap.
     * @param to address to receive the minted tokens
     * @param amount number of tokens (in wei units, i.e. 18 decimals)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
