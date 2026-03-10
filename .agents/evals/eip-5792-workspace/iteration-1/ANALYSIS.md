# eip-5792 -- Batch Transactions: Detailed Analysis

## Score: 100% with skill | 60% without skill | Delta: +40% (SMALLEST)

## Efficiency

| Metric | With Skill | Without Skill | Diff |
|--------|-----------|---------------|------|
| Time | 176s (2m 56s) | 342s (5m 42s) | -166s (49% faster) |
| Tokens | 41,444 | 73,048 | -31,604 (43% cheaper) |
| Tool calls | 30 | 72 | -42 (58% fewer) |

**Largest efficiency gap** across all 4 skills. Without the skill, the model spent nearly 2x the time and used 1.8x the tokens -- the most exploration overhead of any eval. The model clearly struggled to find the right approach and went through multiple iterations of custom hook code.

## Assertion Breakdown

### Passed in both variants (non-discriminating)
These 6 assertions passed regardless of skill presence -- the highest non-discriminating count:

1. **useCapabilities for wallet detection** -- Both variants detected EIP-5792 wallet support. The model understands capability detection, though the without-skill version wrapped it in a custom `useBatchCallsCapabilities` hook (unnecessary abstraction).
2. **ERC20 contract created** -- Both created a BatchToken.sol. Smart contract scaffolding is standard Solidity knowledge.
3. **Deploy script created** -- Both created deploy scripts. This is basic SE-2 hardhat-deploy knowledge.
4. **Frontend page created** -- Both created a batch transaction page. Standard Next.js page creation.
5. **SE-2 scaffold hooks used** -- Both correctly used `useScaffoldReadContract`, `useScaffoldWriteContract`, etc. The model knows SE-2's hook API well.
6. **No new dependencies needed** -- Both correctly identified that wagmi already ships EIP-5792 hooks. No unnecessary packages added.

### Failed without skill (discriminating -- skill provides Capability Uplift)
These 4 assertions failed without the skill -- all UX-related:

1. **useWriteContracts (not useSendCalls)** -- This is the core API choice. `useWriteContracts` (from `wagmi/experimental`) is a high-level hook that accepts contract calls in a structured format (address, abi, functionName, args) and handles ABI encoding automatically. Without the skill, the model used `useSendCalls` -- a lower-level hook that requires manual `encodeFunctionData` for each call. This led to a **hacky workaround**: a `MAX_CONTRACTS=5` pattern where the model pre-generated 5 sets of `useSendCalls` hooks (one per potential contract) to work around React's rules of hooks. This is fragile, wasteful, and would break with more than 5 contracts.

2. **useShowCallsStatus for batch status** -- After submitting a batch transaction, wallets can display the status of individual calls. `useShowCallsStatus` enables this. Without the skill, there's no way for users to see which calls in the batch succeeded or failed -- they just see a single transaction hash with no granularity.

3. **Graceful fallback for non-EIP-5792 wallets** -- With the skill, the page shows TWO action paths: a "Batch: Approve + Transfer (EIP-5792)" button for supported wallets, and an "Individual: Approve, then Transfer (2 txns)" fallback for wallets like MetaMask that don't support EIP-5792 yet. Without the skill, there's only the batch button -- users with unsupported wallets simply can't use the feature.

4. **Batch button disabled when unsupported** -- With the skill, the batch button has `disabled={... || !isEIP5792Wallet}`, preventing users from clicking it when their wallet doesn't support batching. Without the skill, the button's disabled condition only checks for pending state and input validation -- it doesn't check EIP-5792 support. Clicking it with an unsupported wallet would throw a runtime error.

## Root Cause Analysis

eip-5792 is different from the other 3 skills. The model's **core knowledge is mostly correct**:
- It knows EIP-5792 exists and what it does
- It knows about `wagmi/experimental` hooks
- It knows about wallet capability detection
- It correctly chose not to add dependencies

What the model misses are **UX patterns** -- how to build a production-quality interface around the technical capability:

| Category | With Skill | Without Skill |
|----------|-----------|---------------|
| API level | High-level (`useWriteContracts`) | Low-level (`useSendCalls` + manual encoding) |
| Status display | `useShowCallsStatus` for wallet UI | No status display |
| Unsupported wallets | Dual-path (batch + individual) | Single path (batch only, breaks) |
| Safety | Button disabled when unsupported | Button enabled, crashes at runtime |

The model treated EIP-5792 as a purely technical integration. The skill added the human layer -- what happens when things aren't supported, how to show status, how to provide alternatives.

## The MAX_CONTRACTS=5 Anti-Pattern

Worth calling out specifically: without the skill, the model created a `useBatchCalls` hook that pre-generates 5 instances of `useSendCalls`:

```typescript
const MAX_CONTRACTS = 5;
// Creates hooks[0] through hooks[4] at the top level
// Then only uses hooks[0] at runtime
```

This violates React's rules of hooks in spirit (hooks should be meaningful, not padded). It's a creative workaround for a self-imposed constraint -- if the model had used `useWriteContracts` instead of `useSendCalls`, no workaround would have been needed.

## Key Takeaway

eip-5792 demonstrates the **UX knowledge gap** pattern. The model knows the protocol and the hooks, but the skill's 40% uplift comes entirely from UX decisions: fallback paths, status display, and defensive disabling. This is the smallest delta because the model's technical knowledge is strong -- the gap is in product thinking, not API knowledge. For teams building production dApps (not just demos), these UX patterns are the difference between "works in a demo" and "works for real users with real wallets."
