// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SilverDollar (SLVR) - A capped stablecoin with 6 decimals and gasless approvals
contract SilverDollar is ERC20, ERC20Capped, ERC20Permit, Ownable {
    /// @notice Maximum supply: 10 million tokens (with 6 decimals)
    uint256 private constant MAX_SUPPLY = 10_000_000 * 10 ** 6;

    constructor(address initialOwner)
        ERC20("SilverDollar", "SLVR")
        ERC20Capped(MAX_SUPPLY)
        ERC20Permit("SilverDollar")
        Ownable(initialOwner)
    {}

    /// @notice Override decimals to return 6 instead of the default 18
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mint new SLVR tokens. Only the contract owner can call this.
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to mint (in smallest unit, i.e. 6 decimal places)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @dev Required override for _update when combining ERC20 and ERC20Capped.
    /// ERC20Capped overrides _update to enforce the cap check on minting.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
