# SE-2 Agent Skill Evals — File Index

How everything is organized, what each file does, and where to find it.

## Quick Links

| What you're looking for | Where it is |
|------------------------|-------------|
| Executive summary (for blog posts) | `BENCHMARK_SUMMARY.md` |
| Full detailed report with all assertions | `BENCHMARK_REPORT.md` |
| Original eval plan & methodology | `EVAL_PLAN.md` |
| Combined benchmark data (all 4 skills) | `combined-workspace/iteration-1/benchmark.json` |
| Interactive viewer | Run the viewer (see "Viewer" section below) |
| Per-skill deep analysis | `<skill>-workspace/iteration-1/ANALYSIS.md` |

## Directory Structure

```
.agents/evals/
├── INDEX.md                      ← you are here
├── EVAL_PLAN.md                  ← methodology, skill classifications, A/B test design
├── BENCHMARK_REPORT.md           ← full report with per-assertion breakdowns
├── BENCHMARK_SUMMARY.md          ← executive summary for blog posts
│
├── combined-workspace/           ← all 4 skills merged (feeds the viewer)
│   └── iteration-1/
│       ├── benchmark.json        ← combined benchmark data with detailed notes
│       ├── feedback.json         ← reviewer feedback from the viewer UI
│       └── eval-*/               ← one dir per skill eval (see "Eval Directory" below)
│
├── x402-workspace/               ← x402 skill standalone workspace
│   ├── evals.json                ← assertion definitions
│   └── iteration-1/
│       ├── ANALYSIS.md           ← detailed analysis: stale API pattern
│       ├── benchmark.json        ← x402-only benchmark data
│       ├── feedback.json         ← reviewer feedback
│       └── eval-x402-api-monetization/
│
├── drizzle-neon-workspace/       ← drizzle-neon skill standalone workspace
│   └── iteration-1/
│       ├── ANALYSIS.md           ← detailed analysis: integration knowledge gap (100% delta)
│       ├── benchmark.json
│       └── eval-drizzle-db-integration/
│
├── ponder-workspace/             ← ponder skill standalone workspace
│   └── iteration-1/
│       ├── ANALYSIS.md           ← detailed analysis: version boundary + SE-2 bridge
│       ├── benchmark.json
│       └── eval-ponder-event-indexing/
│
└── eip-5792-workspace/           ← eip-5792 skill standalone workspace
    └── iteration-1/
        ├── ANALYSIS.md           ← detailed analysis: UX knowledge gap
        ├── benchmark.json
        └── eval-eip5792-batch-txns/
```

## Eval Directory Structure

Each eval (e.g., `eval-x402-api-monetization/`) follows the same layout:

```
eval-<name>/
├── eval_metadata.json            ← eval ID, name, prompt, assertion definitions
├── with_skill/
│   ├── grading.json              ← pass/fail for each assertion with evidence
│   ├── timing.json               ← tokens used, duration in ms
│   └── outputs/
│       └── summary.md            ← human-readable grading summary
└── without_skill/
    ├── grading.json
    ├── timing.json
    └── outputs/
        └── summary.md
```

## File Descriptions

### Reports (for humans / blog posts)

| File | Purpose |
|------|---------|
| `EVAL_PLAN.md` | The original evaluation plan. Classifies all 11 skills into Capability Uplift vs Encoded Preference, defines A/B test prompts, scoring rubric, and priority tiers. |
| `BENCHMARK_SUMMARY.md` | One-page executive summary. Results table, key findings, per-skill highlights, efficiency insights. Designed for blog posts. |
| `BENCHMARK_REPORT.md` | Full detailed report. Per-assertion breakdowns for all 4 skills, cross-skill analysis, methodology notes. |
| `*/ANALYSIS.md` | Deep-dive per skill. Efficiency tables, discriminating vs non-discriminating assertions, root cause analysis, key takeaway. |

### Data (JSON, machine-readable)

| File | Schema | Purpose |
|------|--------|---------|
| `benchmark.json` | See below | Aggregated results: pass rates, timing, tokens, per-run expectations, notes |
| `grading.json` | `{expectations: [{text, passed, evidence}], pass_rate, passed, failed, total}` | Per-assertion grading for a single run |
| `timing.json` | `{total_tokens, duration_ms, total_duration_seconds}` | Resource usage for a single run |
| `eval_metadata.json` | `{eval_id, eval_name, prompt, assertions?}` | Eval configuration |
| `feedback.json` | `{reviews: [{run_id, feedback, timestamp}], status}` | Human reviewer feedback from the viewer UI |
| `evals.json` | `{skill_name, evals: [{id, prompt, expected_output, assertions}]}` | Assertion definitions (x402 workspace only) |

### benchmark.json schema

```json
{
  "metadata": {
    "skill_name": "...",
    "executor_model": "claude-opus-4-6",
    "timestamp": "...",
    "evals_run": ["eval-name-1", "eval-name-2"],
    "runs_per_configuration": 1
  },
  "runs": [
    {
      "eval_id": 0,
      "eval_name": "...",
      "configuration": "with_skill | without_skill",
      "run_number": 1,
      "result": {
        "pass_rate": 1.0,
        "passed": 10, "failed": 0, "total": 10,
        "time_seconds": 184.3,
        "tokens": 39805,
        "tool_calls": 40,
        "errors": 0
      },
      "expectations": [
        {"text": "assertion description", "passed": true, "evidence": "..."}
      ],
      "notes": ["detailed analysis notes for this run"]
    }
  ],
  "run_summary": {
    "with_skill": {
      "pass_rate": {"mean": 1.0, "stddev": 0.0, "min": 1.0, "max": 1.0},
      "time_seconds": {"mean": 183.7, "stddev": 23.3},
      "tokens": {"mean": 40692, "stddev": 4189}
    },
    "without_skill": { "..." },
    "delta": {"pass_rate": "+0.60", "time_seconds": "-83.4", "tokens": "-12467"}
  },
  "notes": ["top-level cross-skill analysis notes"]
}
```

## Interactive Viewer

The viewer is a Python HTTP server that serves a single-page HTML app with two tabs:

- **Outputs tab**: Click through each eval, see the prompt, output files, grading results, and leave feedback
- **Benchmark tab**: Summary table, per-eval breakdown with assertion pass/fail, and analysis notes (both per-run and top-level)

### How to run it

```bash
# From the project root
python3 ~/.claude/plugins/cache/claude-plugins-official/skill-creator/205b6e0b3036/skills/skill-creator/eval-viewer/generate_review.py \
  .agents/evals/combined-workspace/iteration-1 \
  --skill-name "SE-2 Tier 1 Skills" \
  --benchmark .agents/evals/combined-workspace/iteration-1/benchmark.json
```

Opens at **http://localhost:3117** by default. Use `--port <N>` to change.

### Viewer source files

Located in the skill-creator plugin cache (not in this repo):

```
~/.claude/plugins/cache/claude-plugins-official/skill-creator/
  205b6e0b3036/skills/skill-creator/
    eval-viewer/
    ├── generate_review.py         ← Python HTTP server + HTML generator
    └── viewer.html                ← Single-page app template (JS + CSS)
    scripts/
    ├── aggregate_benchmark.py     ← Combines grading.json + timing.json into benchmark.json
    ├── generate_report.py         ← Generates markdown reports from benchmark data
    ├── run_eval.py                ← Runs a single eval with/without skill
    ├── run_loop.py                ← Description optimization loop
    ├── improve_description.py     ← LLM-based description improvement
    ├── package_skill.py           ← Packages a skill into a .skill file
    ├── quick_validate.py          ← Quick validation checks
    └── utils.py                   ← Shared utilities
```

### Static HTML export

For sharing without running a server:

```bash
python3 .../generate_review.py \
  .agents/evals/combined-workspace/iteration-1 \
  --skill-name "SE-2 Tier 1 Skills" \
  --benchmark .agents/evals/combined-workspace/iteration-1/benchmark.json \
  --static /tmp/eval-report.html
```

## Results at a Glance

| Skill | With Skill | Without Skill | Delta |
|-------|-----------|---------------|-------|
| drizzle-neon | 10/10 (100%) | 0/10 (0%) | **+100%** |
| x402 | 10/10 (100%) | 5/10 (50%) | **+50%** |
| ponder | 10/10 (100%) | 5/10 (50%) | **+50%** |
| eip-5792 | 10/10 (100%) | 6/10 (60%) | **+40%** |
| **Average** | **100%** | **40%** | **+60%** |

## How the eval was run

1. Each skill was tested with an A/B setup: **with_skill** (agent has SKILL.md) vs **without_skill** (agent has no hints)
2. Each agent ran in an isolated git worktree (clean SE-2 checkout)
3. 10 assertions per skill, targeting Capability Uplift areas
4. Grading done by reading agent output files and checking assertions against evidence
5. Model: `claude-opus-4-6` for both execution and grading
6. Single run per configuration (not averaged across multiple runs)
