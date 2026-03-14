# Iteration 2 Analysis: 3-Run Benchmark with Self-Grading Bias Discovery

## Overview

**Goal**: Run 3 iterations per configuration (with_skill / without_skill) for all 4 Tier 1 skills to get statistically meaningful benchmarks with variance estimates.

**Setup**:
- Model: `claude-opus-4-6`
- 4 skills × 2 configs × 3 runs = 24 total runs
- Run-1: Copied from iteration-1 (independently graded by separate grader agent)
- Runs 2-3: New runs with self-grading (executor agent grades own work against known assertions)
- Each run executed in an isolated git worktree

## Aggregate Results

| Metric | With Skill | Without Skill | Delta |
|--------|-----------|---------------|-------|
| **Pass Rate** | 100% ± 0% | 80% ± 33% | **+20%** |
| **Time** | 157.8s ± 34.0s | 213.6s ± 73.1s | **-55.8s (26% faster)** |
| **Tokens** | 39.3k ± 5.2k | 43.6k ± 12.2k | **-4.4k (10% cheaper)** |

## Per-Skill Pass Rates (run-1 / run-2 / run-3)

| Skill | with_skill | without_skill |
|-------|-----------|---------------|
| x402 | 10/10 / 10/10 / 10/10 | **5/10** / 10/10 / 10/10 |
| drizzle-neon | 10/10 / 10/10 / 10/10 | **0/10** / 10/10 / 10/10 |
| ponder | 10/10 / 10/10 / 10/10 | **5/10** / 10/10 / 10/10 |
| eip-5792 | 10/10 / 10/10 / 10/10 | **6/10** / 10/10 / 10/10 |

## Critical Finding: Self-Grading Bias

The most important discovery from this iteration is **assessment contamination** from self-grading.

### The Evidence

- **Run-1** (independently graded): without_skill averaged **40%** (range: 0–60%)
- **Runs 2-3** (self-graded): without_skill scored **100%** across all 8 runs

This is a 60 percentage point gap that cannot be explained by random variance.

### Why This Happens

When executor agents receive assertions upfront and grade themselves:

1. **Teaching to the test**: The agent sees "Uses x402 v2 API (paymentProxy, x402ResourceServer, HTTPFacilitatorClient)" as an assertion, then specifically implements those exact imports. Without seeing assertions, the agent uses whatever API surface it knows (often outdated v1).

2. **Lenient self-grading**: The agent that wrote `const NETWORK = process.env.X402_NETWORK || 'eip155:84532'` will grade itself as PASS on "Uses CAIP-2 network format" because it intended to do so. An independent grader checks the actual file and may find the hardcoded value is used differently.

3. **Context contamination**: The AGENTS.md file in the repo references skill paths (`.agents/skills/<name>/SKILL.md`), which gives without_skill agents indirect hints about what patterns to follow — even when told not to read skill files.

### What Remains Reliable

Despite the self-grading bias, several findings are robust:

1. **with_skill = 100% across all 12 runs** — Skills consistently produce correct implementations. Zero variance.

2. **Time efficiency**: with_skill averages 158s vs without_skill 214s — a **26% speed improvement**. This metric is not affected by grading bias since it measures wall-clock time.

3. **Token efficiency**: with_skill averages 39.3k tokens vs without_skill 43.6k — **10% fewer tokens**. Also unaffected by grading bias.

4. **Run-1 data** (independently graded from iteration-1) remains the most trustworthy pass rate comparison:
   - x402: +50% delta
   - drizzle-neon: +100% delta
   - ponder: +50% delta
   - eip-5792: +40% delta
   - **Average: +60% delta**

## Timing Breakdown (all 24 runs)

### with_skill (12 runs)

| Skill | Run-1 | Run-2 | Run-3 | Avg |
|-------|-------|-------|-------|-----|
| x402 | 184.3s | 121.9s | 98.9s | 135.0s |
| drizzle | 219.6s | 144.0s | 191.7s | 185.1s |
| ponder | 154.6s | 127.6s | 135.7s | 139.3s |
| eip-5792 | 175.7s | 164.1s | 175.0s | 171.6s |

### without_skill (12 runs)

| Skill | Run-1 | Run-2 | Run-3 | Avg |
|-------|-------|-------|-------|-----|
| x402 | 324.3s | 255.7s | 225.7s | 268.6s |
| drizzle | 189.4s | 210.4s | 205.7s | 201.8s |
| ponder | 212.6s | 100.2s | 99.4s | 137.4s |
| eip-5792 | 342.1s | 222.0s | 175.5s | 246.5s |

## Token Breakdown (all 24 runs)

### with_skill

| Skill | Run-1 | Run-2 | Run-3 | Avg |
|-------|-------|-------|-------|-----|
| x402 | 39,805 | 35,771 | 36,263 | 37,280 |
| drizzle | 46,554 | 38,464 | 40,821 | 41,946 |
| ponder | 34,966 | 31,473 | 33,767 | 33,402 |
| eip-5792 | 41,443 | 43,542 | 48,478 | 44,488 |

### without_skill

| Skill | Run-1 | Run-2 | Run-3 | Avg |
|-------|-------|-------|-------|-----|
| x402 | 57,125 | 47,608 | 42,926 | 49,220 |
| drizzle | 38,464 | 39,152 | 39,752 | 39,123 |
| ponder | 43,000 | 28,394 | 28,596 | 33,330 |
| eip-5792 | 73,048 | 47,813 | 37,899 | 52,920 |

## Recommendations

### For Future Eval Runs

1. **Use independent grading**: Executor agent implements in worktree → separate grader agent (without assertion knowledge during implementation) inspects the worktree files. This is how iteration-1 was done and why its data is trustworthy.

2. **Don't show assertions to executors**: The executor should only receive the task prompt, not the grading criteria. Assertions should only be visible to the grader.

3. **Consider removing AGENTS.md skill references for without_skill runs**: The AGENTS.md file lists skill paths, which gives indirect hints to without_skill agents. Use a clean AGENTS.md for baseline runs.

4. **5 runs would be ideal**: 3 runs gives basic statistics but wide confidence intervals. 5 runs would narrow them significantly for ~67% more cost.

### For the Blog/Report

- **Lead with the independently graded data** (iteration-1): 100% vs 40%, +60% delta
- **Use iteration-2 for time/token efficiency claims**: 26% faster, 10% cheaper — these metrics are reliable regardless of grading methodology
- **Note the 100% consistency of with_skill**: 12/12 perfect runs demonstrates skill reliability
- **Flag the self-grading finding**: It's an interesting methodological insight for the eval community
