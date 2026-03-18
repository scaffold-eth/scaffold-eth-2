// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * SilverDollar (SLVR) - A stablecoin with 6 decimals, capped supply of 10 million tokens,
 * gasless approvals via ERC-2612 (Permit), and owner-restricted minting.
 */
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

	/**
	 * Mint new SLVR tokens. Only the contract owner can call this.
	 * @param to The address that will receive the minted tokens.
	 * @param amount The amount of tokens to mint (in smallest unit, i.e. 6 decimal places).
	 */
	function mint(address to, uint256 amount) external onlyOwner {
		_mint(to, amount);
	}

	/**
	 * Required override because both ERC20 and ERC20Capped define _update.
	 */
	function _update(
		address from,
		address to,
		uint256 value
	) internal override(ERC20, ERC20Capped) {
		super._update(from, to, value);
	}
}
