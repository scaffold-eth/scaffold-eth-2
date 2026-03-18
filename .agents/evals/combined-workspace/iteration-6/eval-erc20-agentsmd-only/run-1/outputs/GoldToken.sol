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
    constructor(address _owner) ERC20("GoldToken", "GOLD") ERC20Capped(1_000_000 * 10 ** 18) Ownable(_owner) {}

    /**
     * Allows the owner to mint new tokens to a specified address.
     * @param _to The address to receive the minted tokens.
     * @param _amount The amount of tokens to mint (in wei units).
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
}
