# Iteration 3 Plan: Independent Grading with Bias Controls

## Goal

Re-run evaluations with **independent grading** (2-phase pipeline) to get trustworthy pass rate data that matches iteration-1's methodology, at scale (5 runs per config).

## Key Problem from Iteration 2

Self-grading inflated without_skill scores from 40% → 100%. Two causes:
1. **Teaching to the test**: Executor sees assertions → implements to satisfy them
2. **Lenient self-grading**: Executor judges own work generously

## Architecture: 2-Phase Pipeline

### Phase 1: Execution (no assertions visible)

```
For each (skill × config × run):
  1. Launch executor agent in isolated worktree
  2. Executor receives ONLY the task prompt (from eval_metadata.json)
  3. Executor implements the solution
  4. Executor writes outputs to outputs/ directory
  5. Record timing.json (tokens, duration)
  6. PRESERVE the worktree (don't clean up yet)
```

**Critical**: The executor prompt must NOT contain assertions. It should only include:
- The task prompt from eval_metadata.json
- For `with_skill`: instruction to read the relevant SKILL.md
- For `without_skill`: no skill file reference

### Phase 2: Grading (separate agent, assertions visible)

```
For each completed execution:
  1. Launch grader agent (using .agents/grader.md definition)
  2. Grader receives:
     - assertions from eval_metadata.json
     - path to worktree outputs directory
     - path to execution transcript (if available)
  3. Grader inspects actual files in the worktree
  4. Grader writes grading.json
  5. Clean up worktree
```

**Critical**: Grader never sees the executor's self-assessment. Grader only sees file artifacts.

## Configuration Matrix

| Skill | Config | Runs | Total |
|-------|--------|------|-------|
| x402 | with_skill | 5 | 5 |
| x402 | without_skill | 5 | 5 |
| drizzle-neon | with_skill | 5 | 5 |
| drizzle-neon | without_skill | 5 | 5 |
| ponder | with_skill | 5 | 5 |
| ponder | without_skill | 5 | 5 |
| eip-5792 | with_skill | 5 | 5 |
| eip-5792 | without_skill | 5 | 5 |
| **Total** | | | **40 runs** |

### Why 5 Runs

- 3 runs: mean + stddev, but wide confidence intervals (±58% of stddev)
- 5 runs: stddev estimate improves by ~40%, confidence intervals tighten significantly
- 7+ runs: diminishing returns for ~40% more cost
- **Budget**: ~40 executor runs × ~40k tokens ≈ 1.6M executor tokens + ~40 grader runs × ~15k tokens ≈ 600k grader tokens = **~2.2M total tokens**

### Why Still Run with_skill

Even though with_skill was 100% across 12 runs in iteration-2, we should run 5 more because:
1. The grader is stricter than self-grading — with_skill pass rate might drop slightly
2. We need comparable grading methodology across both configs
3. 17 total with_skill runs (12 iteration-2 + 5 iteration-3) gives very tight confidence bounds

## AGENTS.md Context Contamination Fix

### The Problem

AGENTS.md contains a "Skills & Agents Index" section that lists skill names and paths:
```
- **x402** — HTTP 402 payment-gated routes, micropayments...
- **drizzle-neon** — Drizzle ORM, Neon PostgreSQL...
```

This gives `without_skill` agents indirect hints about patterns, even when they aren't told to read skill files.

### The Fix: Clean AGENTS.md for without_skill

Create a modified AGENTS.md that removes the Skills & Agents Index section entirely:

```bash
# Before launching without_skill executors in worktree:
# 1. Copy AGENTS.md to AGENTS.md.bak
# 2. Remove the "Skills & Agents Index" section
# 3. Run executor
# 4. Restore AGENTS.md.bak → AGENTS.md (not needed if worktree is isolated)
```

Since we use worktree isolation, we can modify AGENTS.md in the worktree without affecting the main repo. The executor agent in the worktree will see a clean AGENTS.md with no skill hints.

**Implementation**: Before the executor starts in the worktree, run:
```bash
# In the worktree, strip the Skills & Agents Index section
sed -i '' '/^## Skills & Agents Index/,/^## /{ /^## Skills & Agents Index/d; /^## [^S]/!d; }' AGENTS.md
```

Or more safely, use a prepared clean AGENTS.md template.

## Execution Plan

### Step 1: Prepare Directory Structure

```
.agents/evals/combined-workspace/iteration-3/
├── PLAN.md (this file)
├── eval-x402-api-monetization/
│   ├── eval_metadata.json (copy from iteration-1)
│   ├── with_skill/
│   │   ├── run-1/ through run-5/
│   │   │   ├── outputs/
│   │   │   ├── grading.json (from grader)
│   │   │   └── timing.json (from executor)
│   └── without_skill/
│       ├── run-1/ through run-5/
│       │   ├── outputs/
│       │   ├── grading.json
│       │   └── timing.json
├── eval-drizzle-db-integration/
│   ├── ... (same structure)
├── eval-ponder-event-indexing/
│   ├── ... (same structure)
├── eval-eip5792-batch-txns/
│   ├── ... (same structure)
├── benchmark.json (aggregated, from aggregate_benchmark.py)
├── benchmark.md (human-readable summary)
└── ANALYSIS.md (post-run analysis)
```

### Step 2: Ensure Assertions Exist for All Evals

Iteration-1's drizzle-neon, ponder, and eip-5792 eval_metadata.json files have **no assertions defined**. We need to add them before iteration-3.

**Source**: Extract from iteration-1 grading.json files (they contain 10 assertions each with text/passed/evidence). Pull the `text` field from each expectation to create the assertion list.

### Step 3: Execute in Batches

**Batch strategy**: Run 8 agents in parallel (limited by API rate limits and machine resources).

```
Batch 1 (8 executor agents, ~3-4 min):
  - x402/with_skill/run-1, x402/without_skill/run-1
  - drizzle/with_skill/run-1, drizzle/without_skill/run-1
  - ponder/with_skill/run-1, ponder/without_skill/run-1
  - eip5792/with_skill/run-1, eip5792/without_skill/run-1

Batch 2-5: Same pattern for run-2 through run-5
```

After each batch completes:
```
Grade batch (8 grader agents in parallel):
  - For each completed executor, launch grader on its worktree
```

**Total: 5 batches × (8 executors + 8 graders) = 80 agent invocations**

### Step 4: Aggregate and Analyze

```bash
python aggregate_benchmark.py iteration-3/ \
  --skill-name "SE-2 Tier 1 Skills" \
  --skill-path ".agents/skills/"
```

Write ANALYSIS.md comparing iteration-3 results with iteration-1 and iteration-2.

## Executor Prompt Templates

### with_skill Executor

```
You are evaluating the "{skill_name}" skill for SE-2.

Task: {prompt from eval_metadata.json}

IMPORTANT: Read the skill file at `.agents/skills/{skill_name}/SKILL.md` before implementing. Follow its patterns exactly.

Implement the solution. Write all output files to the `outputs/` directory. Include a `outputs/summary.md` describing what you built.
```

### without_skill Executor (with clean AGENTS.md)

```
You are implementing a feature for SE-2.

Task: {prompt from eval_metadata.json}

Implement the solution using your knowledge. Write all output files to the `outputs/` directory. Include a `outputs/summary.md` describing what you built.
```

Note: No mention of skills, no assertion visibility, no hints.

### Grader Prompt

```
You are grading an evaluation run.

Expectations to evaluate:
{assertions from eval_metadata.json, one per line}

Transcript: {path to transcript if available}
Outputs directory: {path to worktree outputs/}

Follow the grading process in your instructions. Write grading.json to {outputs_dir}/../grading.json.
```

## Success Criteria

1. **All 40 runs complete** with timing.json and grading.json
2. **Grading is independent** — no assertion leakage to executors
3. **AGENTS.md is clean** for without_skill runs — no skill index hints
4. **Aggregated benchmark** shows statistically meaningful differences
5. **Expected outcome**: with_skill ≈ 90-100%, without_skill ≈ 30-50% (matching iteration-1 pattern)

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Rate limits with 8 parallel agents | Reduce to 4 per batch if needed |
| Worktree cleanup failures | Track all worktree paths, cleanup script at end |
| Grader can't find outputs in worktree | Verify worktree paths exist before launching grader |
| Missing assertions for 3 evals | Extract from iteration-1 grading.json before starting |
| Context window exceeded during grading | Keep grader prompt minimal, point at files not inline them |

## Comparison Plan

After iteration-3 completes, produce a cross-iteration comparison:

| Metric | Iter-1 (1 run, independent) | Iter-2 (3 runs, self-graded) | Iter-3 (5 runs, independent) |
|--------|----------------------------|------------------------------|------------------------------|
| with_skill pass rate | 100% | 100% ± 0% | ? |
| without_skill pass rate | 40% | 80% ± 33% | ? |
| Delta | +60% | +20% | ? |
| Time efficiency | -31% | -26% | ? |
| Token efficiency | -23% | -10% | ? |

The iteration-3 data should be the **definitive benchmark** for the blog/report, combining:
- Trustworthy pass rates (independent grading)
- Statistical significance (5 runs with variance)
- Clean baseline (no AGENTS.md contamination)
