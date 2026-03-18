// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title GoldToken - A capped ERC-20 token with owner-restricted minting
/// @notice Maximum supply is 1,000,000 GOLD tokens (18 decimals)
contract GoldToken is ERC20Capped, Ownable {
    event TokensMinted(address indexed to, uint256 amount);

    constructor(address _owner)
        ERC20("GoldToken", "GOLD")
        ERC20Capped(1_000_000 * 10 ** 18)
        Ownable(_owner)
    {}

    /// @notice Mint new tokens. Only the owner can call this.
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to mint (in wei, i.e. 18 decimals)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // Required override because both ERC20 and ERC20Capped define _update
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
