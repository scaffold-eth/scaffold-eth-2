---
name: erc-20
description: "Add an ERC-20 token contract to a Scaffold-ETH 2 project. Use when the user wants to: create a fungible token, deploy an ERC-20, add token minting, build a token transfer UI, or work with ERC-20 tokens in SE-2."
---

# ERC-20 Token Integration for Scaffold-ETH 2

## Prerequisites

This skill is designed for Scaffold-ETH 2 (SE-2) projects. If the user is **not already inside an SE-2 project**, use the `ethereum-app-builder` skill from this same skill package to scaffold one first, then come back here to add ERC-20.

How to check: look for `packages/nextjs/` and either `packages/hardhat/` or `packages/foundry/` in the project root, along with a root `package.json` with SE-2 workspace scripts (`yarn chain`, `yarn deploy`, `yarn start`).

## Overview

[ERC-20](https://eips.ethereum.org/EIPS/eip-20) is the standard interface for fungible tokens on Ethereum. This skill covers adding an ERC-20 token contract to a Scaffold-ETH 2 project using [OpenZeppelin's ERC-20 implementation](https://docs.openzeppelin.com/contracts/5.x/erc20), along with deployment scripts and a frontend for interacting with the token.

For anything not covered here, refer to the [OpenZeppelin ERC-20 docs](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20) or search the web. This skill focuses on what's hard to discover: SE-2 integration specifics, common pitfalls, and ERC-20 gotchas that trip up both humans and AI.

## SE-2 Project Context

Scaffold-ETH 2 (SE-2) is a yarn (v3) monorepo for building dApps on Ethereum. It comes in two flavors based on the Solidity framework:

- **Hardhat flavor**: contracts at `packages/hardhat/contracts/`, deploy scripts at `packages/hardhat/deploy/`
- **Foundry flavor**: contracts at `packages/foundry/contracts/`, deploy scripts at `packages/foundry/script/`

Check which exists in the project to know the flavor. Both flavors share:

- **`packages/nextjs/`**: React frontend (Next.js App Router, @scaffold-ui/components, Tailwind + DaisyUI, RainbowKit, Wagmi, Viem). Uses `~~` path alias for imports.
- **`packages/nextjs/contracts/deployedContracts.ts`**: auto-generated after `yarn deploy`, contains ABIs, addresses, and deployment block numbers for all contracts, keyed by chain ID.
- **`packages/nextjs/scaffold.config.ts`**: project config including `targetNetworks` (array of viem chain objects).
- **Root `package.json`**: monorepo scripts that proxy into workspaces (e.g. `yarn chain`, `yarn deploy`, `yarn start`).

SE-2 uses `@scaffold-ui/components` for blockchain/Ethereum components (addresses, balances, etc.) and DaisyUI + Tailwind for general component and styling.

The deployment scripts go alongside the existing deploy scripts, and the frontend page goes in the nextjs package. After deployment, `deployedContracts.ts` auto-generates the ABI and address, so the frontend can interact with the token using SE-2's scaffold hooks (`useScaffoldReadContract`, `useScaffoldWriteContract`).

Look at the actual project structure and contracts before setting things up. Adapt to what's there rather than following this skill rigidly.

## Dependencies

OpenZeppelin contracts are already included in SE-2's Hardhat and Foundry setups, so no additional dependency installation is needed. If for some reason they're missing:

- **Hardhat**: `@openzeppelin/contracts` in `packages/hardhat/package.json`
- **Foundry**: installed via `forge install OpenZeppelin/openzeppelin-contracts`, with remapping `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/`

No new frontend dependencies are required.

## Smart Contract

The token contract extends OpenZeppelin's `ERC20` base. Import path: `@openzeppelin/contracts/token/ERC20/ERC20.sol`. The constructor takes a token name and symbol. Beyond that, add whatever minting/access control logic the project needs.

Syntax reference for a basic token with open minting:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
```

Adapt the contract name, symbol, and minting logic based on the user's requirements. Common extensions (all under `@openzeppelin/contracts/token/ERC20/extensions/`):

- **`ERC20Capped`**: enforces a maximum supply, set once in constructor as immutable
- **`ERC20Burnable`**: adds `burn(amount)` and `burnFrom(account, amount)` for holders to destroy tokens
- **`ERC20Pausable`**: lets an admin freeze all transfers (useful for emergency stops or regulatory compliance)
- **`ERC20Permit`** (ERC-2612): gasless approvals via off-chain signatures, effectively standard for new tokens now
- **`ERC20Votes`**: governance checkpoints, tracks historical voting power per address. Replaces the deprecated `ERC20Snapshot` from v4
- **`ERC20FlashMint`** (ERC-3156): flash loan minting, tokens are minted and must be returned (+fee) within a single transaction
- **Access-controlled minting**: use `Ownable` or `AccessControl` from OpenZeppelin

See [OpenZeppelin's ERC-20 extensions](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#extensions) for the full list. The [Contracts Wizard](https://wizard.openzeppelin.com/) is useful for generating a starting template with specific features.

### OpenZeppelin v5 changes to be aware of

If referencing older tutorials or code, note these breaking changes in OpenZeppelin v5:

- **`_beforeTokenTransfer` and `_afterTokenTransfer` hooks are gone.** Replaced by a single `_update(address from, address to, uint256 value)` override point for customizing mint, transfer, and burn behavior.
- **`increaseAllowance()` and `decreaseAllowance()` were removed** from the base contract.
- **Custom errors** replaced revert strings (e.g. `ERC20InsufficientBalance` instead of `require(balance >= amount, "...")`)
- **Explicit named imports are required**: `import {ERC20} from "..."` not `import "..."`

## Deployment

### Hardhat

Deploy script goes in `packages/hardhat/deploy/`. SE-2 uses `hardhat-deploy`, so the script exports a `DeployFunction`. Use a filename like `01_deploy_my_token.ts` (numbered to control deploy order). The `autoMine` flag speeds up local deployments.

### Foundry

Add a deploy script in `packages/foundry/script/` and wire it into the main `Deploy.s.sol`. SE-2's Foundry setup uses a `ScaffoldETHDeploy` base contract and `DeployHelpers.s.sol`. Import and call the new deploy script from `Deploy.s.sol`'s run function.

## Decimals: The Most Common Source of Bugs

ERC-20 tokens default to 18 decimals, but many major tokens use different values. Getting this wrong causes balances to display as astronomically wrong numbers or makes contract math silently produce garbage.

| Token | Decimals | Why it matters |
|-------|----------|----------------|
| USDC | 6 | The most used stablecoin in DeFi uses 6, not 18 |
| USDT | 6 | Same as USDC |
| WBTC | 8 | Mirrors Bitcoin's satoshi precision |
| DAI | 18 | Standard |
| WETH | 18 | Standard |

**Frontend impact**: `formatEther` from viem assumes 18 decimals. For tokens with different decimals, use `formatUnits(value, decimals)` instead. Similarly, use `parseUnits(amount, decimals)` instead of `parseEther`.

**Contract math impact**: When performing arithmetic between tokens with different decimals, you must normalize. A raw value of `1000000` means 1.0 USDC (6 decimals) but 0.000000000001 for an 18-decimal token. Always call `decimals()` and normalize rather than hardcoding 18.

## Gotchas and Non-Standard Behaviors in the Wild

These are real behaviors of deployed tokens that break common assumptions. Important when building contracts or frontends that interact with existing ERC-20 tokens.

### Missing return values

Per the standard, `transfer()` and `transferFrom()` should return `bool`. In practice, USDT, BNB, and OMG return `void` (no return data). Calling these through the standard `IERC20` interface reverts because Solidity's ABI decoder expects 32 bytes of return data and gets 0.

**Solution**: Use OpenZeppelin's `SafeERC20` wrapper, which handles both no-return-value and false-return tokens:

```solidity
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

using SafeERC20 for IERC20;
token.safeTransfer(to, amount);      // instead of token.transfer(to, amount)
token.safeTransferFrom(from, to, amount);
token.forceApprove(spender, amount);  // handles USDT's approve-to-zero requirement
```

### USDT's approve-to-zero requirement

USDT's `approve` function reverts if you set a non-zero allowance when the current allowance is already non-zero. You must first `approve(spender, 0)` then `approve(spender, newAmount)`. SafeERC20's `forceApprove()` handles this automatically.

### Upgradeable proxies

USDC and USDT are deployed behind upgradeable proxies. The token admin can change the implementation at any time, potentially altering transfer semantics or adding fees. USDC and USDT both have fee infrastructure built in (currently set to 0%) that could be activated in the future.

### Fee-on-transfer tokens

Some tokens deduct a percentage on every transfer (e.g. PAXG has a 0.02% fee). This breaks any contract that assumes `amount sent == amount received`. The safe pattern is to measure the actual balance change:

```solidity
uint256 balanceBefore = token.balanceOf(address(this));
token.safeTransferFrom(user, address(this), amount);
uint256 received = token.balanceOf(address(this)) - balanceBefore;
```

### Rebasing tokens

Tokens like stETH and AMPL change balances without any transfer event. `balanceOf()` returns different values at different times for the same holder. Any contract that caches balances will have wrong accounting. Use the wrapped version (wstETH instead of stETH) which has stable balances.

## Security Considerations

### Approve/transferFrom front-running (the race condition)

When Alice changes an approval from 100 to 50, a malicious Bob can front-run the second `approve` by spending the full 100, then spend the new 50 after it lands. Total stolen: 150 instead of 50.

Mitigations:
- Approve to zero first, then set the new value (two transactions)
- Use `SafeERC20.forceApprove()` which handles this
- Use [Permit2](https://github.com/Uniswap/permit2) for a universal signature-based approval system

### ERC-777 reentrancy via transfer hooks

ERC-777 tokens implement `tokensToSend` and `tokensReceived` hooks that fire during transfers. These tokens are backward-compatible with ERC-20, so protocols may unknowingly accept them. The imBTC/Uniswap V1 exploit drained ~$300K and the dForce/Lendf.Me exploit stole $25M using this vector.

Mitigation: Use `nonReentrant` modifier from OpenZeppelin on any function that interacts with arbitrary ERC-20 tokens. Follow the checks-effects-interactions pattern.

### Flash loan governance attacks

Any governance mechanism based on token balance at call time can be manipulated: borrow tokens via flash loan, vote, return tokens. Use `ERC20Votes` with checkpoints instead of raw `balanceOf()` for governance.

## Well-Known Token Addresses (Ethereum Mainnet)

For reference when integrating with existing tokens. All verified on [Etherscan](https://etherscan.io/tokens).

| Token | Address | Decimals | Quirks |
|-------|---------|----------|--------|
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | 6 | No return value, approve-to-zero required, blocklist, pausable, upgradeable |
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | 6 | Blocklist, pausable, upgradeable |
| DAI | `0x6B175474E89094C44Da98b954EedeAC495271d0F` | 18 | Non-standard permit signature, flash-mintable |
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | 18 | Has `deposit()`/`withdraw()`, no permit |
| WBTC | `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` | 8 | Standard ERC-20 |
| LINK | `0x514910771AF9Ca656af840dff83E8264EcF986CA` | 18 | Implements ERC-677 (`transferAndCall`) |