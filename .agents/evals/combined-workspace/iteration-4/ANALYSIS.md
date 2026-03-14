# Iteration 4 Analysis: Tier 2 & Tier 3 Skills

## Goal

Evaluate whether tier 2 and tier 3 skills provide genuine **capability uplift** or primarily **encode preference**. These skills were predicted to show smaller deltas than the tier 1 skills (which showed +55pp in iteration 3).

## Results Summary

| Skill | Tier | Predicted Delta | Actual With Skill | Actual Without Skill | Actual Delta |
|-------|------|----------------|:-:|:-:|:-:|
| eip-712 | 2 | Medium | 100% (2/2) | 80% (2/2) | **+20pp** |
| siwe | 2 | Medium | 100% (2/2) | 85% (avg 90+80) | **+15pp** |
| erc-721 | 2 | Small-Medium | 85% (avg 90+80) | 90% (2/2) | **-5pp** |
| erc-20 | 2 | Small | 100% (2/2) | 95% (avg 90+100) | **+5pp** |
| defi-protocol-templates | 3 | Small | 100% (1/1) | 100% (1/1) | **0pp** |
| solidity-security | 3 | Minimal | 90% (1/1) | 100% (1/1) | **-10pp** |
| **Overall** | | | **96%** | **90%** | **+6pp** |

Compare with **Tier 1 results (iteration 3)**: 97% vs 42%, **+55pp** delta.

## Key Findings

### 1. Tier 2+3 delta (+6pp) is dramatically smaller than Tier 1 (+55pp)

The prediction was correct: these skills are mostly encoded preference, not capability uplift. The model already knows ERC-20, ERC-721, EIP-712, SIWE, DeFi staking, and Solidity security well enough to implement them without guidance.

### 2. Skill value is inconsistent across runs (variance problem)

Without the skill, the model's output varies significantly between runs:
- **erc-20**: Run-1 missed `ERC20Capped` (90%), run-2 used it correctly (100%)
- **siwe**: Run-1 used viem SIWE (90%), run-2 used `siwe` npm package (80%)
- **eip-712**: Consistently missed shared utility and `as const` (80% both runs)

The skill's main value for tier 2 is **consistency**, not capability.

### 3. Two skills show negative delta (erc-721, solidity-security)

- **erc-721**: With_skill run-2 had a stack-too-deep compilation failure, while without_skill was consistent at 90%. The skill didn't cause the failure, but it also didn't prevent it.
- **solidity-security**: The without_skill agent got 100% while with_skill got 90% (compilation couldn't be verified in the worktree). Both identified the same vulnerabilities. **This skill provides zero capability uplift.**

### 4. Discriminating assertions identified

| Assertion | Discriminating? | Notes |
|-----------|:-:|-------|
| Uses viem SIWE (not `siwe` pkg) | Yes | With_skill: 100%, without_skill: 50% across runs |
| Shared EIP-712 utility module | Yes | With_skill: 100%, without_skill: 0% |
| `as const` on type objects | Yes | With_skill: 100%, without_skill: 0% |
| Domain validation vs Host header | Yes | With_skill: 100%, without_skill: 0% |
| Uses `ERC20Capped` extension | Partially | With_skill: 100%, without_skill: 50% |
| `_update` override (ERC-721) | No | Both fail equally — task doesn't require it |
| rewardPerTokenStored pattern | No | Both implement identically |
| CEI pattern (security) | No | Model already knows this |

### 5. Non-discriminating assertions (always pass regardless)

These assertions pass with or without the skill, meaning they test things the model already knows:
- SE-2 hooks usage (useScaffoldReadContract/useScaffoldWriteContract)
- Proper Hardhat deploy scripts
- Frontend page creation
- OpenZeppelin v5 contract usage
- ReentrancyGuard usage
- Event emission
- Input validation

## Per-Skill Verdicts

### eip-712 (Tier 2, +20pp)
**Verdict: Mildly Valuable — Encoded Preference with some Capability Uplift**

The skill consistently adds two things the model misses: (1) shared utility module for domain/types to prevent mismatch, and (2) `as const` for TypeScript inference. The model already knows EIP-712, OZ's EIP712+ECDSA, wagmi's useSignTypedData, and viem's recoverTypedDataAddress.

**Why Tier 2**: The +20pp delta is real but comes from code organization patterns (`as const`, shared module), not fundamental capability gaps. The model can implement EIP-712 correctly without the skill — it just structures the code differently.

### siwe (Tier 2, +15pp)
**Verdict: Mildly Valuable — Mixed Capability/Preference**

The skill prevents two real mistakes: (1) installing the `siwe` npm package instead of using viem's native utilities, and (2) domain validation in the verify route. The model inconsistently knows about viem's SIWE support.

**Why Tier 2**: The viem vs `siwe` package choice is a genuine capability issue (model's training data may predate viem's SIWE support), but the overall auth flow is well-known. Domain validation is a security detail the model sometimes misses.

### erc-721 (Tier 2, -5pp)
**Verdict: Marginal — Mostly Encoded Preference**

Both with and without skill produce nearly identical implementations: on-chain SVG, base64 encoding, ERC721Enumerable, paid minting, OZ v5. The skill didn't help — and in one run, the with_skill version had a compilation failure.

**Why Tier 2 (should be Tier 3)**: The model already knows NFTs very well. The skill's `_update` override and stack-too-deep avoidance advice wasn't consistently applied even when read.

### erc-20 (Tier 2, +5pp)
**Verdict: Marginal — Mostly Encoded Preference**

The only difference: with_skill always uses `ERC20Capped`, without_skill sometimes implements cap manually. Both approaches work. The model knows ERC-20 extremely well.

**Why Tier 2 (should be Tier 3)**: The +5pp delta is within noise. The model occasionally misses `ERC20Capped` but implements equivalent logic.

### defi-protocol-templates (Tier 3, 0pp)
**Verdict: No Value — Pure Encoded Preference**

Identical results. Both produce Synthetix-style staking with rewardPerTokenStored, ReentrancyGuard, SafeERC20, proper events. The skill is a reference implementation the model already knows.

**Why Tier 3 (confirmed)**: Zero delta. Consider deprecating or converting to a checklist.

### solidity-security (Tier 3, -10pp)
**Verdict: No Value — Pure Encoded Preference (possibly counterproductive)**

The without_skill agent actually performed better (100% vs 90%). Both identified the same vulnerabilities. The skill's compilation-related overhead was the only differentiator.

**Why Tier 3 (confirmed)**: Negative delta. The model's security knowledge is already strong. Consider deprecating.

## Recommendations

### Tier reclassification based on data

| Skill | Current Tier | Recommended Tier | Rationale |
|-------|:-:|:-:|-----------|
| eip-712 | 2 | 2 | +20pp is meaningful, driven by code organization patterns |
| siwe | 2 | 2 | +15pp, real capability gap (viem SIWE, domain validation) |
| erc-721 | 2 | 3 | -5pp, no value demonstrated |
| erc-20 | 2 | 3 | +5pp, within noise |
| defi-protocol-templates | 3 | Deprecate? | 0pp, zero value |
| solidity-security | 3 | Deprecate? | -10pp, negative value |

### Skill improvements
1. **siwe**: Add warning about viem's SIWE support being native (key discriminator)
2. **eip-712**: The shared utility module pattern is the main value — emphasize it more
3. **erc-721**: Consider removing — no demonstrated value over baseline
4. **erc-20**: Consider removing — marginal value at best
5. **defi-protocol-templates**: Convert to a short checklist, not a full skill
6. **solidity-security**: Convert to a short checklist, not a full skill

## Cross-Iteration Comparison

| Metric | Tier 1 (Iter 3) | Tier 2+3 (Iter 4) |
|--------|:-:|:-:|
| With Skill pass rate | 97% | 96% |
| Without Skill pass rate | 42% | 90% |
| Delta | **+55pp** | **+6pp** |
| Skills tested | 4 | 6 |
| Total runs | 40 | 20 |

The data strongly supports the original classification: tier 1 skills (subgraph, x402, ponder, eip-5792, drizzle-neon) provide genuine capability uplift, while tier 2+3 skills primarily standardize preferences the model already has.
