# SE-2 Agent Skill Benchmark — Executive Summary

> **TL;DR:** Skills provide a **+60% average capability uplift** on integration-heavy tasks. Models know the basics but use wrong/outdated APIs and miss SE-2-specific integration bridges. Skills also make models faster and cheaper.

## Results at a Glance

| Skill | With Skill | Without Skill | Delta | Time (W/WO) | Tokens (W/WO) |
|-------|-----------|---------------|-------|-------------|----------------|
| **drizzle-neon** | 10/10 (100%) | 0/10 (0%) | **+100%** | 220s / 189s | 47k / 38k |
| **x402** | 10/10 (100%) | 5/10 (50%) | **+50%** | 184s / 324s | 40k / 57k |
| **ponder** | 10/10 (100%) | 5/10 (50%) | **+50%** | 155s / 213s | 35k / 43k |
| **eip-5792** | 10/10 (100%) | 6/10 (60%) | **+40%** | 176s / 342s | 41k / 73k |
| **Average** | **100%** | **40%** | **+60%** | **184s / 267s** | **41k / 53k** |

## What Skills Add (Model Can't Do Without)

1. **Correct API versions** — x402 v2 API, Ponder v0.7+ virtual modules, wagmi experimental EIP-5792 hooks. Without skills, models hallucinate old/nonexistent package names and APIs.

2. **SE-2 integration bridges** — Reading `deployedContracts.ts` and `scaffoldConfig` from the nextjs package, workspace naming (`@se-2/ponder`), root proxy scripts. These are custom patterns unique to SE-2.

3. **Multi-environment patterns** — Drizzle's tri-driver architecture (Neon serverless vs HTTP vs local pg), NEXT_RUNTIME detection, Docker Compose for local dev. Without the skill, model only implemented one driver.

4. **Silent failure prevention** — `casing: "snake_case"` must match in both Drizzle config AND client (or queries silently return wrong data). Production safety guards. The `.env.development` convention.

5. **UX patterns** — Graceful fallback for non-EIP-5792 wallets, x402 paywall UI for browser visitors, batch transaction status display.

## What Models Already Know

- General architecture (middleware for payment gating, onchainTable for indexing, ERC20 contracts)
- SE-2 basics (scaffold hooks, DaisyUI classes, App Router pages, deploy scripts)
- Standard patterns (env vars, route matchers, handler formats)

## Efficiency Insight

Skills don't just improve correctness — they make models **faster and cheaper**:
- 3 of 4 skills: with-skill was faster (avg 184s vs 293s for those 3)
- 3 of 4 skills: with-skill used fewer tokens (avg 39k vs 57k for those 3)
- Less exploration/guessing when correct APIs are provided upfront

## Per-Skill Highlights

### drizzle-neon (+100% delta — largest)
Without skill, model chose Drizzle + Neon on its own but missed **every single SE-2 integration pattern**: tri-driver, lazy proxy, casing match, file paths, Docker, env convention, production guard. Knows the ORM, doesn't know the integration.

### x402 (+50% delta)
Without skill, model used **wrong package names** (`x402-next` instead of `@x402/next`) and a **hallucinated v1 API** (`paymentMiddleware` instead of `paymentProxy` + `x402ResourceServer`). The x402 v2 API is too new for training data.

### ponder (+50% delta)
Without skill, model used **old Ponder API** (`@ponder/core` instead of `ponder`, `@/generated` instead of virtual modules, express-style instead of Hono). Hardcoded ABI and address instead of bridging to SE-2's deployment output.

### eip-5792 (+40% delta — smallest)
Without skill, model used lower-level `useSendCalls` with manual encoding instead of `useWriteContracts`. Missed `useShowCallsStatus` and graceful fallback. Closest to threshold — model has decent EIP-5792 knowledge but misses UX patterns.

## Methodology

- **Model:** claude-opus-4-6
- **Environment:** Isolated git worktrees per run (clean SE-2 project)
- **Assertions:** 10 per skill, targeting Capability Uplift areas
- **Grading:** File existence, content pattern matching, API correctness
- **Single run per variant** (not averaged across multiple runs)

---

*Generated 2026-03-10. Full detailed report with assertion-level breakdowns: `BENCHMARK_REPORT.md`*
