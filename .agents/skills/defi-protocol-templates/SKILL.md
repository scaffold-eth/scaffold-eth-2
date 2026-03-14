---
name: defi-protocol-templates
description: Implement DeFi protocols with production-ready templates for staking, AMMs, governance, and lending systems. Use when building decentralized finance applications or smart contract protocols.
---

# DeFi Protocol Templates

## Eval Results: Zero Capability Uplift

This skill was evaluated in iteration 4 and showed **0pp delta** — the model produces identical Synthetix-style staking implementations (rewardPerTokenStored, ReentrancyGuard, SafeERC20, updateReward modifier, proper events) with or without this skill.

This skill exists as a lightweight reference checklist, not as implementation guidance the model needs.

## Staking Checklist

When building a staking contract, verify:

- [ ] Uses `rewardPerTokenStored` accumulator pattern (not naive per-block calculation)
- [ ] `nonReentrant` on `stake`, `withdraw`, and `getReward`
- [ ] `updateReward` modifier runs before state changes
- [ ] Events: `Staked`, `Withdrawn`, `RewardPaid`
- [ ] Separate staking token and rewards token (or same token if single-token model)
- [ ] Owner-configurable `rewardRate`
- [ ] `exit()` convenience function combining `withdraw` + `getReward`
- [ ] Deploy script funds the staking contract with reward tokens

## AMM Checklist

- [ ] Constant product formula: `x * y = k`
- [ ] 0.3% swap fee
- [ ] Minimum liquidity lock on first deposit (prevents division by zero)
- [ ] LP shares via geometric mean for initial deposit
- [ ] `ReentrancyGuard` on swap and liquidity functions

## Common Pitfalls

- **Governance with raw `balanceOf()`**: Use `ERC20Votes` with checkpoints — otherwise flash loan attacks can manipulate votes.
- **Missing `SafeERC20`**: External tokens (USDT, BNB) don't return `bool` from `transfer()`.
