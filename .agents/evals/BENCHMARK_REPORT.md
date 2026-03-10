# SE-2 Agent Skill Benchmark Report

> Consolidated results from A/B testing SE-2 agent skills. Each skill is tested with (Variant A) and without (Variant B) the SKILL.md, measuring pass rate, time, and token usage.

**Model:** claude-opus-4-6
**Date:** 2026-03-10
**Methodology:** For each skill, an agent implements a realistic user request in an isolated SE-2 worktree. One agent has access to the SKILL.md, the other relies only on its own knowledge. Both are graded against the same assertions targeting Capability Uplift areas.

---

## Summary Table


| Skill            | Predicted CU | With Skill   | Without Skill | Delta     | Time (W/WO) | Tokens (W/WO) | Verdict   |
| ---------------- | ------------ | ------------ | ------------- | --------- | ----------- | ------------- | --------- |
| **x402**         | 70%          | 10/10 (100%) | 5/10 (50%)    | **+50%**  | 184s / 324s | 40k / 57k     | Essential |
| **drizzle-neon** | 65%          | 10/10 (100%) | 0/10 (0%)     | **+100%** | 220s / 189s | 47k / 38k     | Essential |
| **ponder**       | 70%          | 10/10 (100%) | 5/10 (50%)    | **+50%**  | 155s / 213s | 35k / 43k     | Essential |
| **eip-5792**     | 70%          | 10/10 (100%) | 6/10 (60%)    | **+40%**  | 176s / 342s | 41k / 73k     | Essential |


### Aggregate Stats

- **Average with-skill pass rate:** 100% (40/40)
- **Average without-skill pass rate:** 40% (16/40)
- **Average delta:** +60%
- **Average with-skill time:** 184s | **Average without-skill time:** 267s
- **Average with-skill tokens:** 41k | **Average without-skill tokens:** 53k
- **Skills also make the model faster and cheaper** — less exploration/guessing when correct patterns are provided

---

## Detailed Results

### 1. x402 (Payment-Gated Routes)

**Prompt:** "I want to monetize an API endpoint in my SE-2 dApp with micropayments. When someone calls my API, they should pay a small amount of USDC to access the data."

**Results:** With Skill 10/10 (100%) vs Without Skill 5/10 (50%) — **+50% delta**


| Assertion                                  | With Skill | Without Skill | Discriminating? |
| ------------------------------------------ | ---------- | ------------- | --------------- |
| middleware.ts exists                       | PASS       | PASS          | No              |
| v2 API (paymentProxy, x402ResourceServer)  | PASS       | FAIL          | Yes             |
| registerExactEvmScheme called              | PASS       | FAIL          | Yes             |
| CAIP-2 network format (eip155:84532)       | PASS       | FAIL          | Yes             |
| Paywall setup (createPaywall + evmPaywall) | PASS       | FAIL          | Yes             |
| Protected API route exists                 | PASS       | PASS          | No              |
| Environment variables configured           | PASS       | PASS          | No              |
| Correct @x402/* package names              | PASS       | FAIL          | Yes             |
| Middleware matcher covers routes           | PASS       | PASS          | No              |
| scaffold.config.ts targets baseSepolia     | PASS       | PASS          | No              |


**Key Findings:**

- Without skill, model used **wrong/nonexistent package names** (`x402-next`, `x402-fetch` instead of `@x402/core`, `@x402/next`, `@x402/evm`, `@x402/paywall`)
- Without skill, model used **v1/hallucinated API** (`paymentMiddleware`) instead of v2 (`paymentProxy` + `x402ResourceServer` + `HTTPFacilitatorClient`)
- Without skill, model used **legacy network name** `"base-sepolia"` instead of CAIP-2 `eip155:84532`
- Without skill, **no paywall UI** for browser visitors — would show raw 402 JSON
- With skill: **faster** (184s vs 324s) and **cheaper** (40k vs 57k tokens) — less guessing

**Verdict:** Essential — the x402 v2 API is too new for model training data. The skill provides genuine capability uplift.

---

### 2. drizzle-neon (Database Integration)

**Prompt:** "I need a database for my dApp to store user profiles with wallet addresses. I should be able to create and list users from the frontend."

**Results:** With Skill 10/10 (100%) vs Without Skill 0/10 (0%) — **+100% delta**


| Assertion                                              | With Skill | Without Skill | Discriminating? |
| ------------------------------------------------------ | ---------- | ------------- | --------------- |
| Tri-driver pattern (Neon serverless/HTTP/pg)           | PASS       | FAIL          | Yes             |
| Lazy proxy pattern for deferred connection             | PASS       | FAIL          | Yes             |
| casing: 'snake_case' in both config AND client         | PASS       | FAIL          | Yes             |
| Files at services/database/ path                       | PASS       | FAIL          | Yes             |
| Repository pattern for DB access                       | PASS       | FAIL          | Yes             |
| Root proxy scripts (drizzle-kit, db:seed, db:wipe)     | PASS       | FAIL          | Yes             |
| Docker Compose for local PostgreSQL                    | PASS       | FAIL          | Yes             |
| Uses .env.development (SE-2 convention)                | PASS       | FAIL          | Yes             |
| Production safety guard (PRODUCTION_DATABASE_HOSTNAME) | PASS       | FAIL          | Yes             |
| All required dependencies in correct locations         | PASS       | FAIL          | Yes             |


**Key Findings:**

- Without skill, model chose Drizzle + Neon independently (knows the basics!) but **missed every SE-2 integration pattern**
- Without skill, **only Neon HTTP driver** — no local Docker support, no NEXT_RUNTIME detection, would break in serverless runtime
- Without skill, **no `casing: "snake_case"`** — queries would silently return wrong data due to column name mismatch
- Without skill, used `/db/` instead of `/services/database/` — wrong SE-2 convention
- Without skill, **eager connection on import** (throws if no DATABASE_URL) — no lazy proxy
- Without skill, **no Docker Compose** — no local development story
- Without skill, **no production safety guard** — seed/wipe scripts could destroy production data
- This is the **largest delta of all skills** — model knows Drizzle basics but gets 0% on SE-2 integration

**Verdict:** Essential — the tri-driver pattern, casing gotcha, and SE-2 conventions are all unique to this integration. Largest delta observed.

---

### 3. ponder (Event Indexing)

**Prompt:** "I want to index my contract events so I can query historical data with GraphQL. Set up an indexer that watches the YourContract's GreetingChange event."

**Results:** With Skill 10/10 (100%) vs Without Skill 5/10 (50%) — **+50% delta**


| Assertion                                                      | With Skill | Without Skill | Discriminating? |
| -------------------------------------------------------------- | ---------- | ------------- | --------------- |
| Config reads deployedContracts from SE-2                       | PASS       | FAIL          | Yes             |
| Config reads scaffoldConfig for network                        | PASS       | FAIL          | Yes             |
| Package named @se-2/ponder                                     | PASS       | PASS          | No              |
| Ponder virtual module imports (ponder:registry, ponder:schema) | PASS       | FAIL          | Yes             |
| Schema uses onchainTable API                                   | PASS       | PASS          | No              |
| Handler uses ContractName:EventName format                     | PASS       | PASS          | No              |
| Uses context.db.insert().values() for writes                   | PASS       | PASS          | No              |
| Hono-based API (not old express-style)                         | PASS       | FAIL          | Yes             |
| Root proxy scripts for ponder                                  | PASS       | PASS          | No              |
| ponder-env.d.ts type declaration                               | PASS       | FAIL          | Yes             |


**Key Findings:**

- Without skill, model used **OLD Ponder package** (`@ponder/core` instead of `ponder`) — indicates stale training data
- Without skill, used **OLD import style** (`import { ponder } from "@/generated"` instead of virtual modules `ponder:registry`)
- Without skill, used **OLD express-style API** (`ponder.use('/graphql', graphql())` instead of Hono app)
- Without skill, **hardcoded ABI and contract address** — no bridge to SE-2's `deployedContracts.ts`
- Without skill, **hardcoded chainId 31337** — no dynamic network detection from `scaffoldConfig`
- Model knows the general Ponder concept (onchainTable, handler format, context.db.insert) but has outdated API knowledge

**Verdict:** Essential — Ponder API changed significantly post-v0.7. The skill provides the correct current API and the critical SE-2 bridge.

---

### 4. eip-5792 (Batch Transactions)

**Prompt:** "I want to batch multiple contract calls into a single transaction in my dApp. Users should be able to approve and transfer tokens in one click."

**Results:** With Skill 10/10 (100%) vs Without Skill 6/10 (60%) — **+40% delta**


| Assertion                                  | With Skill | Without Skill | Discriminating? |
| ------------------------------------------ | ---------- | ------------- | --------------- |
| Uses useWriteContracts (not useSendCalls)  | PASS       | FAIL          | Yes             |
| Uses useCapabilities for wallet detection  | PASS       | PASS          | No              |
| Uses useShowCallsStatus for batch status   | PASS       | FAIL          | Yes             |
| Graceful fallback for non-EIP-5792 wallets | PASS       | FAIL          | Yes             |
| Batch button disabled when unsupported     | PASS       | FAIL          | Yes             |
| ERC20 contract with approve+transfer       | PASS       | PASS          | No              |
| Hardhat deploy script                      | PASS       | PASS          | No              |
| Frontend page with batch UI                | PASS       | PASS          | No              |
| Uses SE-2 scaffold hooks                   | PASS       | PASS          | No              |
| No new npm dependencies needed             | PASS       | PASS          | No              |


**Key Findings:**

- Without skill, used **lower-level `useSendCalls`** instead of `useWriteContracts` — required manual `encodeFunctionData` and a hacky `MAX_CONTRACTS=5` padded hook pattern
- Without skill, **no `useShowCallsStatus`** — can't display batch transaction status in wallet's native UI
- Without skill, **no fallback for unsupported wallets** — only one "Batch" button, no individual transaction alternative
- Without skill, **batch button NOT disabled** when wallet doesn't support EIP-5792 — would fail at runtime
- Model knows EIP-5792 exists and can implement it, but misses UX patterns (graceful degradation, status display)
- This was the **smallest delta** among Tier 1 skills — model has decent EIP-5792 knowledge

**Verdict:** Essential but closest to threshold — the UX patterns (fallback, capability detection, status) are the main value-add over base model knowledge.

---

## Cross-Skill Analysis

### What skills consistently add (Capability Uplift patterns)

1. **Correct API versions** — x402 v2, Ponder v0.7+, wagmi experimental hooks. Models have stale training data.
2. **SE-2 integration bridges** — reading `deployedContracts.ts`, `scaffoldConfig`, workspace naming, root proxy scripts
3. **Multi-environment patterns** — tri-driver (drizzle), NEXT_RUNTIME detection, Docker for local dev
4. **Package names** — `@x402/core` vs `x402-next`, `ponder` vs `@ponder/core`
5. **Silent failure prevention** — `casing: "snake_case"` matching, production safety guards, env var conventions

### What models already know (Non-discriminating assertions)

1. **General architecture** — middleware.ts for x402, onchainTable for Ponder, ERC20 contracts
2. **SE-2 basics** — scaffold hooks, DaisyUI classes, workspace naming
3. **File structure** — API routes, pages, deploy scripts
4. **Standard patterns** — env vars, matchers, handler formats

### Efficiency insight

Skills don't just improve correctness — they make the model **faster and cheaper**:

- 3 of 4 skills: with-skill was faster (avg 186s vs 293s)
- 3 of 4 skills: with-skill used fewer tokens (avg 39k vs 53k)
- The skill eliminates exploration/guessing time when the correct API is provided upfront

---

## Methodology Notes

### Assertions Design

Assertions target **Capability Uplift** areas — things the model literally cannot know without the skill (new APIs, SE-2-specific patterns, custom integration bridges). Structural assertions (file exists, env vars present) serve as baselines to confirm the model understands the general concept.

### Discriminating vs Non-Discriminating Assertions

- **Discriminating:** Only passes with skill — measures genuine capability uplift
- **Non-discriminating:** Passes both with and without skill — model already knows this

### Environment

- Each run uses an isolated git worktree (clean SE-2 project)
- No `yarn install` or build verification (file-level correctness only)
- Single run per variant (not averaged across multiple runs)
- Model: claude-opus-4-6

