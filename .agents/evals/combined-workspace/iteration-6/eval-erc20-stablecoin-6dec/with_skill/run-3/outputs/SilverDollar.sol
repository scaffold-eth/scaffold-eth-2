// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SilverDollar (SLVR) - A capped stablecoin with 6 decimals and gasless approvals
/// @notice Only the owner can mint tokens. Supply is capped at 10 million SLVR.
contract SilverDollar is ERC20Capped, ERC20Permit, Ownable {
	uint8 private constant _DECIMALS = 6;
	uint256 private constant _CAP = 10_000_000 * 10 ** _DECIMALS; // 10 million tokens

	constructor(
		address initialOwner
	)
		ERC20("SilverDollar", "SLVR")
		ERC20Capped(_CAP)
		ERC20Permit("SilverDollar")
		Ownable(initialOwner)
	{}

	function decimals() public pure override returns (uint8) {
		return _DECIMALS;
	}

	/// @notice Mint tokens to a specified address (owner only)
	/// @param to The recipient address
	/// @param amount The raw amount (in smallest unit, i.e. 1 SLVR = 1e6)
	function mint(address to, uint256 amount) external onlyOwner {
		_mint(to, amount);
	}

	// Required override: ERC20Capped needs _update to enforce the cap
	function _update(
		address from,
		address to,
		uint256 value
	) internal override(ERC20, ERC20Capped) {
		super._update(from, to, value);
	}
}
