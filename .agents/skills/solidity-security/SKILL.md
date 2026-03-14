---
name: solidity-security
description: Smart contract security checklist for auditing Solidity contracts. Use when auditing existing contracts or reviewing security of smart contract code.
---

# Solidity Security Checklist

## Eval Results: Zero Capability Uplift (Negative Delta)

This skill was evaluated in iteration 4 and showed **-10pp delta** — the model identifies the same vulnerabilities and applies the same fixes (CEI, ReentrancyGuard, input validation, custom errors, event emission) with or without this skill.

This skill exists as a lightweight audit checklist, not as implementation guidance.

## Audit Checklist

When reviewing a Solidity contract, check:

- [ ] **Reentrancy**: External calls happen after state updates (CEI pattern), or `nonReentrant` modifier is used
- [ ] **Access control**: Critical functions use `onlyOwner`, `AccessControl`, or custom modifiers
- [ ] **Input validation**: Zero-address checks on constructor params, empty-string checks, bounds checks
- [ ] **Integer safety**: `unchecked` blocks only where overflow is mathematically impossible
- [ ] **Event emission**: All state-changing functions emit events
- [ ] **Custom errors**: Use `error ErrorName()` + `revert ErrorName()` instead of `require(condition, "string")` (saves gas)
- [ ] **Pull over push**: Users withdraw funds themselves rather than contract pushing payments
- [ ] **No `tx.origin`**: Use `msg.sender` for authentication
- [ ] **External call return values**: Check `(bool success, )` from `.call{}`
- [ ] **Pragma**: Pin to specific version, not floating `>=0.8.0 <0.9.0`
- [ ] **Delegatecall**: Never to untrusted contracts
- [ ] **Emergency stop**: `Pausable` for critical contracts

## The One Thing to Double-Check

The model consistently catches standard vulnerabilities. The main risk is **not compiling after fixes** — always verify the modified contract compiles before finishing.
