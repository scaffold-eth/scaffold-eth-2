---
name: erc-20
description: "Add an ERC-20 token contract to a Scaffold-ETH 2 project. Use when the user wants to: create a fungible token, deploy an ERC-20, add token minting, build a token transfer UI, or work with ERC-20 tokens in SE-2."
---

# ERC-20 Token Integration for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Gotchas the Model Tends to Miss

The model already knows ERC-20 well (OpenZeppelin v5, deployment, SE-2 hooks, frontend). This skill exists only for specific pitfalls.

### 1. Use `ERC20Capped` for Max Supply — Don't Implement Manually

When the user wants a capped supply, use OpenZeppelin's `ERC20Capped` extension rather than implementing the cap check manually. Manual implementations are functionally equivalent but miss the `_update` override pattern that ERC20Capped provides, and they don't integrate with other extensions that also override `_update`.

```solidity
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CappedToken is ERC20Capped, Ownable {
    constructor(address initialOwner, uint256 cap)
        ERC20("MyToken", "MTK")
        ERC20Capped(cap)
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Required when combining ERC20 + ERC20Capped in OZ v5
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
```

### 2. `SafeERC20` When Interacting with External Tokens

USDT, BNB, and OMG return `void` instead of `bool` from `transfer()`. Calling them through `IERC20` reverts. USDT also requires `approve(spender, 0)` before setting a new non-zero allowance.

```solidity
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

using SafeERC20 for IERC20;
token.safeTransfer(to, amount);
token.forceApprove(spender, amount);  // handles USDT's approve-to-zero
```

### 3. Fee-on-Transfer Tokens

Some tokens (e.g., PAXG) deduct a fee on transfer. Contracts that assume `amount sent == amount received` will have wrong accounting. Measure the actual balance change:

```solidity
uint256 balanceBefore = token.balanceOf(address(this));
token.safeTransferFrom(user, address(this), amount);
uint256 received = token.balanceOf(address(this)) - balanceBefore;
```

### 4. Decimals in Frontend

`formatEther` from viem assumes 18 decimals. For tokens with different decimals (USDC=6, WBTC=8), use `formatUnits(value, decimals)` and `parseUnits(amount, decimals)` instead.
