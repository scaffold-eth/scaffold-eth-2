# Agent Skill Evaluation Plan

## Executive Summary

We analyzed all 11 SE-2 agent skills to determine whether they provide **Capability Uplift** (model literally cannot do this correctly without the skill) or **Encoded Preference** (model could do something reasonable, skill ensures consistency).

### Classification Results

| Skill | Capability Uplift | Encoded Preference | Predicted A/B Delta | Verdict |
|-------|-------------------|-------------------|---------------------|---------|
| subgraph | 75% | 25% | **Large** | Essential — ABI copy bridge, Docker networking, AssemblyScript gotchas |
| x402 | 70% | 30% | **Large** | Essential — v2 API too new for training data; entire middleware pattern is custom |
| ponder | 70% | 30% | **Large** | Essential — API changed significantly; SE-2 bridge config is entirely custom |
| eip-5792 | 70% | 30% | **Large** | Essential — wallet capability detection, burner wallet support, fallback patterns |
| drizzle-neon | 65% | 35% | **Medium-Large** | Valuable — tri-driver pattern is unique; model knows Drizzle basics |
| eip-712 | 60% | 40% | **Medium** | Valuable — model knows EIP-712 but misses SE-2 integration specifics |
| siwe | 55% | 45% | **Medium** | Valuable — model knows SIWE but will install wrong package, miss edge cases |
| erc-721 | 45% | 55% | **Small-Medium** | Useful — model knows NFTs well; skill adds OZ v5 specifics and on-chain SVG |
| erc-20 | 40% | 60% | **Small** | Marginal — model knows ERC-20 very well; skill mainly adds safety gotchas |
| defi-protocol-templates | 30% | 70% | **Small** | Marginal — model knows DeFi patterns; skill is mostly curated reference |
| solidity-security | 25% | 75% | **Minimal** | Low value — model's security knowledge is already strong; skill is a checklist |

### Key Insights

**Highest-value skills** are integration-heavy (subgraph, x402, ponder, eip-5792, drizzle-neon). They encode:
- Custom bridging scripts between SE-2 workspaces (ABI copy, deployedContracts readers)
- SE-2 monorepo conventions (workspace naming, root script proxies)
- Docker configurations with exact image versions and networking
- API patterns too new for model training data (x402 v2, Ponder v0.7+)

**Lowest-value skills** are knowledge-reference (solidity-security, defi-protocol-templates). The model already knows these patterns from training. Their main value is consistency (always suggesting the same architecture), not capability.

**Recommended actions:**
1. **Start A/B testing with Tier 1** (5 high-CU skills) — they'll show the clearest signal
2. **Consider trimming** solidity-security and defi-protocol-templates — or restructuring them as checklists rather than full skills
3. **Monitor capability saturation** — as models improve, erc-20/erc-721 skills may become unnecessary

### Testing Priority

| Tier | Skills | Runs per variant | Rationale |
|------|--------|-----------------|-----------|
| **Tier 1** | subgraph, x402, ponder, eip-5792, drizzle-neon | 3× each | High CU — biggest expected delta |
| **Tier 2** | eip-712, siwe, erc-721, erc-20 | 2× each | Mixed — moderate expected delta |
| **Tier 3** | defi-protocol-templates, solidity-security | 1× each | High EP — sanity check only |

---

## Detailed Plan

### Overview

This document defines the A/B testing framework for evaluating whether SE-2 agent skills provide genuine value. Based on Anthropic's skill evaluation methodology, each skill is classified by its value type (Capability Uplift vs Encoded Preference), then tested with and without the skill to measure the delta.

## Evaluation Infrastructure

### Test Environment Setup

```bash
# For each test run, create a fresh SE-2 project
mkdir /tmp/se2-eval-{skill}-{variant}
cd /tmp/se2-eval-{skill}-{variant}
npx create-eth@latest --project . --solidity-framework hardhat --install
```

### Eval Runner

Use `/skill-creator` with `benchmark` mode when available. Otherwise, run manually:

1. **Fresh SE-2 project** per test (no contamination)
2. **Record**: files created, build status, token usage, time elapsed
3. **3 runs per variant** (A and B) to measure consistency
4. **Blind comparison** where possible — judge outputs without knowing which variant produced them

### Scoring Rubric (per dimension, 0-3 scale)

| Score | Meaning |
|-------|---------|
| 0 | Completely wrong or missing |
| 1 | Partially correct, major issues |
| 2 | Mostly correct, minor issues |
| 3 | Fully correct, production-ready |

---

## Skill Classifications

### 1. drizzle-neon

**Primary value type: Capability Uplift (65%) + Encoded Preference (35%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| Smart database client with auto-driver detection (Neon serverless vs HTTP vs pg) | Capability Uplift | Custom tri-driver architecture unique to this integration; model has no way to know the `NEXT_RUNTIME` detection pattern |
| Lazy proxy pattern for db instance | Capability Uplift | Non-obvious pattern to prevent eager connection on import |
| `casing: "snake_case"` must match in both config and client | Capability Uplift | Silent failure mode — queries return wrong data; model unlikely to discover this |
| Root package.json proxy scripts (`yarn drizzle-kit` → workspace) | Capability Uplift | SE-2 monorepo convention |
| Repository pattern for DB access | Encoded Preference | Model knows multiple patterns; skill picks repository pattern |
| Drizzle ORM over Prisma/TypeORM | Encoded Preference | Model knows all ORMs; skill picks Drizzle |
| Neon PostgreSQL over Supabase/PlanetScale | Encoded Preference | Model knows multiple providers; skill picks Neon |
| Docker Compose for local Postgres | Encoded Preference | Model could use Docker or local install |
| File structure (`services/database/config/`, `repositories/`) | Encoded Preference | Model would pick a reasonable structure, but not this exact one |
| Schema at `services/database/config/schema.ts` | Capability Uplift | SE-2 convention for service file placement |
| `.env.development` vs `.env.local` | Capability Uplift | SE-2 uses `.env.development` for local config, not `.env.local` |
| `PRODUCTION_DATABASE_HOSTNAME` safety guard | Capability Uplift | Custom pattern to prevent accidental production data wipe |
| react-query pattern for client-side data | Encoded Preference | Model knows react-query; skill shows specific composition |
| Column type reference table | Encoded Preference | Available in Drizzle docs |
| `drizzle-kit push` vs `generate`+`migrate` workflow | Encoded Preference | Standard Drizzle workflow |
| `drizzle-seed` dev dependency placement | Capability Uplift | Specific to this integration's seed/wipe scripts |

**A/B Test Prompt:** "I want to add a database to my SE-2 dApp to store user profiles with their wallet addresses. I need to be able to create, read, and list users from the frontend."

---

### 2. subgraph

**Primary value type: Capability Uplift (75%) + Encoded Preference (25%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| ABI copy bridge script (reads `deployedContracts.ts`, outputs to `abis/` and `networks.json`) | Capability Uplift | Custom script bridging SE-2's deployment output to The Graph; model cannot know this |
| Docker Compose with exact image versions and `host.docker.internal` networking | Capability Uplift | Specific image versions, port mappings, and Docker-to-localhost bridging |
| `subgraph.yaml` manifest format with SE-2 contract names | Capability Uplift | Bridging SE-2 naming to Graph manifest conventions |
| Graph Client (`@graphprotocol/client-cli`) + `.graphclientrc.yml` config | Capability Uplift | Less common Graph Client approach (vs plain graphql-request) |
| AssemblyScript gotchas (no closures, no Array.map, BigInt.fromI32) | Capability Uplift | Critical footguns that trip up AI generating WASM-targeted code |
| `local-ship` composite command | Capability Uplift | Custom script chaining abi-copy→codegen→build→deploy-local |
| Port conflict warning (5432 with drizzle-neon) | Capability Uplift | Cross-skill interaction model can't predict |
| Linux `--hostname 0.0.0.0` requirement | Capability Uplift | Platform-specific Docker networking gotcha |
| `create-local` once-only semantics | Capability Uplift | Non-obvious operational constraint |
| Root package.json proxy scripts | Capability Uplift | SE-2 monorepo convention |
| `@se-2/subgraph` workspace naming | Capability Uplift | SE-2 workspace naming convention |
| Solidity-to-GraphQL type mapping table | Encoded Preference | Available in Graph docs, but model might get edge cases wrong |
| `@entity(immutable: true)` for event logs | Encoded Preference | Best practice, model may or may not know |
| `event` field must match exact Solidity signature (indexed matters) | Capability Uplift | Non-obvious; `indexed` in event signature is required |
| `~~/.graphclient` import path for generated artifacts | Capability Uplift | SE-2 specific path alias with generated directory |

**A/B Test Prompt:** "I want to index my smart contract events so I can query them via GraphQL. I'm using SE-2 with the default YourContract. Set up event indexing for the GreetingChange event."

---

### 3. x402

**Primary value type: Capability Uplift (70%) + Encoded Preference (30%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| v2 API structure (`x402ResourceServer`, `HTTPFacilitatorClient`, `registerExactEvmScheme`, `createPaywall`) | Capability Uplift | x402 is a new protocol; model's training data likely has v1 or no data |
| `paymentProxy` middleware pattern for Next.js | Capability Uplift | Specific to `@x402/next` v2 integration |
| CAIP-2 network identifier format (`eip155:84532`) | Capability Uplift | v2-specific; older docs use plain network names |
| Facilitator requirement and URL | Capability Uplift | Non-obvious architecture; model might assume peer-to-peer |
| `registerExactEvmScheme` on both server and client sides | Capability Uplift | Must be called in two places; easy to miss one |
| Don't use hardhat localhost for x402 | Capability Uplift | Facilitator can't verify local chain payments |
| `@x402/fetch` + `wrapFetchWithPayment` for CLI testing | Capability Uplift | Specific testing pattern |
| Type declarations needed for Hardhat ESM compatibility | Capability Uplift | ESM/CJS interop issue specific to this setup |
| x402 protocol flow diagram (client→402→sign→retry→settle) | Capability Uplift | Mental model for the protocol |
| `scaffold.config.ts` must target `baseSepolia` for x402 | Capability Uplift | SE-2 config requirement specific to x402 |
| `$0.01` price syntax means USDC | Encoded Preference | Convention, but important to know |
| Paywall config (`testnet: true/false`, `appName`, `appLogo`) | Encoded Preference | Standard config options |
| Protected route structure (`/api/payment/`, `/payment/`) | Encoded Preference | Model could pick any route prefix |
| `matcher` must cover protected routes in middleware | Capability Uplift | Next.js middleware gotcha combined with x402 |

**A/B Test Prompt:** "I want to monetize an API endpoint in my SE-2 dApp with micropayments. When someone calls my API, they should pay a small amount of USDC to access the data."

---

### 4. siwe

**Primary value type: Capability Uplift (55%) + Encoded Preference (45%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| Use viem's native SIWE utilities, NOT the `siwe` npm package | Capability Uplift | Model would likely install the `siwe` package; viem has native support |
| `iron-session` for encrypted cookie sessions | Encoded Preference | Model knows multiple session libraries; skill picks iron-session |
| Nonce-first flow (fetch→create message→sign→verify→session) | Encoded Preference | Standard SIWE flow; model likely knows this |
| `hasSeenWalletConnected` ref to prevent false auto-logout on page refresh | Capability Uplift | Subtle race condition; wallet reconnects async after refresh |
| ERC-6492 smart wallet support via `createPublicClient` per chain | Capability Uplift | Non-obvious that smart wallet verification needs a chain-specific client |
| `SUPPORTED_CHAINS` map in verify route | Capability Uplift | Must be maintained; model wouldn't know to add this |
| `getSessionPassword()` with dev fallback | Encoded Preference | Reasonable security pattern; model could implement differently |
| Domain validation against Host header | Capability Uplift | Critical security check; model might skip or implement incorrectly |
| Session vs wallet address mismatch detection | Capability Uplift | Subtle UX issue unique to wallet-based auth |
| Auto-logout on wallet disconnect | Encoded Preference | Good UX; model might or might not implement |
| Separate `siwe.config.ts` for tunable parameters | Encoded Preference | Organizational preference |
| `cookieOptions` with secure/httpOnly/sameSite | Encoded Preference | Standard security settings; model likely knows |
| API route structure (`/api/siwe/nonce`, `/verify`, `/session`) | Encoded Preference | Model would pick a reasonable structure |
| `useSiwe` hook composition (combines useAccount, useSignMessage, fetch) | Encoded Preference | Natural composition; model could implement similarly |

**A/B Test Prompt:** "Add wallet-based authentication to my SE-2 dApp. Users should be able to sign in with their Ethereum wallet, and the session should persist across page refreshes."

---

### 5. ponder

**Primary value type: Capability Uplift (70%) + Encoded Preference (30%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| `ponder.config.ts` reads `deployedContracts` and `scaffoldConfig` from nextjs package | Capability Uplift | Custom bridge between SE-2 and Ponder; model can't know this |
| Dynamic contract config generation from `deployedContracts` | Capability Uplift | SE-2-specific pattern |
| `@se-2/ponder` workspace naming and root script proxies | Capability Uplift | SE-2 monorepo convention |
| Ponder virtual modules (`ponder:registry`, `ponder:schema`, `ponder:api`) | Capability Uplift | Ponder-specific; model might have outdated API |
| `onchainTable` schema API (not older `createSchema`) | Capability Uplift | Ponder v0.7+ breaking change; model likely has old API |
| Handler format `"ContractName:EventName"` | Capability Uplift | Ponder convention; model might use wrong format |
| `context.db.insert(table).values({})` for writes | Capability Uplift | Current Ponder API; changed from older versions |
| Hono-based API setup for GraphQL | Capability Uplift | Ponder v0.7+ switched to Hono; model might use older express-style |
| `NEXT_PUBLIC_PONDER_URL` env var for frontend | Capability Uplift | SE-2 integration pattern |
| graphql-request + react-query frontend pattern | Encoded Preference | Model knows both; skill shows specific composition |
| Solidity-to-Ponder type mapping | Encoded Preference | Could be discovered from docs |
| PGlite for dev, Postgres for prod | Encoded Preference | Ponder's default; model might not know |
| `ponder-env.d.ts` boilerplate | Capability Uplift | Required file that's easy to forget |

**A/B Test Prompt:** "I want to index my contract events and serve them via a GraphQL API. Set up an indexer for my SE-2 project that watches the YourContract's GreetingChange event."

---

### 6. erc-20

**Primary value type: Encoded Preference (60%) + Capability Uplift (40%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| OpenZeppelin v5 breaking changes (`_update` replaces hooks, custom errors) | Capability Uplift | Model's training might have v4 patterns |
| `SafeERC20` for USDT/BNB missing return values | Capability Uplift | Critical real-world bug; model might use raw `transfer()` |
| USDT approve-to-zero requirement | Capability Uplift | Non-obvious gotcha; `forceApprove()` solution |
| Fee-on-transfer token pattern (measure balance delta) | Capability Uplift | Non-obvious if building DeFi |
| Rebasing token caveats (stETH → wstETH) | Capability Uplift | Model might not warn about this |
| Decimals table (USDC=6, WBTC=8) | Encoded Preference | Model likely knows major token decimals |
| `formatUnits(value, decimals)` vs `formatEther` | Encoded Preference | viem API; model likely knows |
| Extension list (Capped, Burnable, Pausable, Permit, Votes, FlashMint) | Encoded Preference | Available in OZ docs |
| Well-known token addresses table | Encoded Preference | Publicly available |
| Basic contract syntax reference | Encoded Preference | Model can write ERC-20 contracts |
| ERC-777 reentrancy vector | Capability Uplift | Obscure cross-standard attack; model might miss |
| Flash loan governance attacks | Encoded Preference | Well-documented attack vector |
| Approve/transferFrom front-running | Encoded Preference | Well-known race condition |

**A/B Test Prompt:** "Create an ERC-20 token in my SE-2 project with capped supply, minting restricted to the owner, and a frontend page to mint and transfer tokens."

---

### 7. erc-721

**Primary value type: Encoded Preference (55%) + Capability Uplift (45%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| On-chain SVG metadata pattern | Capability Uplift | Complex pattern with Base64 encoding; model might not implement correctly |
| ERC-2981 royalty standard integration | Capability Uplift | Specific implementation details model might miss |
| ERC721A for gas-efficient batch minting | Capability Uplift | Alternative implementation model might not suggest |
| Soulbound tokens (ERC-5192) with `_update` override | Capability Uplift | Requires OZ v5 pattern; model might use v4 approach |
| Metadata JSON schema | Encoded Preference | Standard format; model knows |
| IPFS vs Arweave vs on-chain storage comparison | Encoded Preference | Model knows trade-offs |
| OpenZeppelin v5 changes | Capability Uplift | Same as ERC-20 |
| Approval security gotchas | Encoded Preference | Well-documented |
| Well-known NFT addresses | Encoded Preference | Publicly available |
| ERC-721C (Creator Token Standard) | Capability Uplift | Newer standard; model might not know |

**A/B Test Prompt:** "Build an NFT contract in my SE-2 project with on-chain SVG metadata, minting with a price, and a gallery page to display minted NFTs."

---

### 8. eip-712

**Primary value type: Capability Uplift (60%) + Encoded Preference (40%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| Domain separator configuration for SE-2 (reading contract address from deployment) | Capability Uplift | SE-2-specific bridge between deployed contract and EIP-712 domain |
| Solidity `DOMAIN_SEPARATOR` with `block.chainid` and `address(this)` | Encoded Preference | Standard pattern; model likely knows |
| Utility module pattern for typed data construction | Encoded Preference | Organizational choice |
| `useSignTypedData` + `useVerifyTypedData` from wagmi | Encoded Preference | Standard wagmi hooks |
| Backend verification with `recoverTypedDataAddress` from viem | Capability Uplift | Specific viem function; model might use ethers.js equivalent |
| Type hash collision prevention (nested struct references) | Capability Uplift | Subtle encoding bug |
| Domain separator changes on chain fork | Capability Uplift | Non-obvious security consideration |
| Frontend verification pattern composing multiple hooks | Encoded Preference | Standard composition |

**A/B Test Prompt:** "Add off-chain message signing to my SE-2 project. Users should sign a structured message (like a vote or an order) and the smart contract should verify the signature on-chain."

---

### 9. eip-5792

**Primary value type: Capability Uplift (70%) + Encoded Preference (30%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| `useWriteContracts` for batching (not `useWriteContract`) | Capability Uplift | Easy to confuse with singular hook |
| `useCapabilities` for detecting wallet support | Capability Uplift | Not widely documented; model might skip detection |
| `useShowCallsStatus` for transaction receipts | Capability Uplift | EIP-5792 specific hook |
| Wallet compatibility matrix | Capability Uplift | Which wallets support which features; hard to discover |
| Paymaster integration via `capabilities` field | Capability Uplift | ERC-7677 integration within EIP-5792 |
| Fallback for wallets without batch support | Capability Uplift | Model might not handle the non-batching case |
| Burner wallet support for `wallet_sendCalls` | Capability Uplift | SE-2's burner connector supports this; model would assume it doesn't |
| Smart contract with multiple functions that compose well | Encoded Preference | Generic contract design |

**A/B Test Prompt:** "I want to batch multiple contract calls into a single transaction in my SE-2 dApp. Users should be able to approve and transfer tokens in one click."

---

### 10. defi-protocol-templates

**Primary value type: Encoded Preference (70%) + Capability Uplift (30%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| Staking contract pattern | Encoded Preference | Well-known pattern; model can implement |
| AMM constant product formula | Encoded Preference | Standard DeFi primitive |
| Governance token pattern | Encoded Preference | Standard pattern |
| Flash loan implementation | Encoded Preference | Standard pattern |
| ReentrancyGuard on all external functions | Capability Uplift | Model might miss specific functions |
| Minimum liquidity lock (AMM) | Capability Uplift | Uniswap V2 pattern to prevent division by zero; model might miss |
| `nonReentrant` on `stake`/`withdraw` specifically | Capability Uplift | Model might only put it on `withdraw` |
| Reward calculation with `rewardPerTokenStored` | Encoded Preference | Standard math; model knows |
| Gas optimization patterns | Encoded Preference | Common knowledge |

**A/B Test Prompt:** "Build a staking dApp where users can stake an ERC-20 token and earn rewards over time. Include the smart contract and a frontend to stake, unstake, and view rewards."

---

### 11. solidity-security

**Primary value type: Encoded Preference (75%) + Capability Uplift (25%)**

| Instruction/Section | Type | Why |
|---------------------|------|-----|
| CEI pattern | Encoded Preference | Well-known security pattern |
| Reentrancy examples | Encoded Preference | Classic vulnerability; model knows |
| Access control patterns | Encoded Preference | Standard OZ patterns |
| Front-running mitigation | Encoded Preference | Well-documented |
| Pull-over-push payment pattern | Encoded Preference | Well-known pattern |
| Gas optimization table | Encoded Preference | Common knowledge |
| Audit preparation checklist | Encoded Preference | Standard practice |
| Circuit breaker pattern | Encoded Preference | Standard OZ Pausable |
| Specific real-world exploit references | Capability Uplift | Concrete examples add educational value |
| Integer overflow post-Solidity 0.8 nuances | Capability Uplift | Subtle — unchecked blocks still vulnerable |
| Delegatecall + storage layout attack | Capability Uplift | Complex attack model might oversimplify |

**A/B Test Prompt:** "Audit my YourContract for security vulnerabilities and suggest improvements. Then implement the fixes."

---

## Evaluation Criteria Matrix

For each test run, score on these 6 dimensions (0-3 scale):

| Dimension | What to check | Weight |
|-----------|---------------|--------|
| **Correctness** | Does it build? Do integrations connect? No runtime errors? | 25% |
| **SE-2 Integration** | Monorepo workspace structure, scaffold.config.ts, deployedContracts pattern, yarn workspace scripts, `~~` imports | 20% |
| **Completeness** | All files created? Dependencies in right package.json? Scripts in root? Env vars documented? | 20% |
| **Consistency** | Same architecture across 3 runs? Same library choices? | 15% |
| **Gotcha Avoidance** | Avoids known pitfalls from SKILL.md? (port conflicts, casing mismatches, wrong drivers, version incompatibilities) | 10% |
| **Developer Experience** | Clear next steps? Testable? README/comments helpful? | 10% |

### Weighted Score Calculation

```
Score = (Correctness × 0.25) + (SE2_Integration × 0.20) + (Completeness × 0.20) +
        (Consistency × 0.15) + (Gotcha_Avoidance × 0.10) + (DX × 0.10)
```

Max score: 3.0 per variant.

---

## Test Execution Protocol

### Per Skill (11 skills × 2 variants × 3 runs = 66 total runs)

For practical purposes, prioritize skills by expected value. Run all skills but invest more analysis time on high-Capability-Uplift skills.

#### Priority Tiers

**Tier 1 — High Capability Uplift (run 3× each variant, deep analysis):**
- subgraph (75% CU)
- x402 (70% CU)
- ponder (70% CU)
- eip-5792 (70% CU)
- drizzle-neon (65% CU)

**Tier 2 — Mixed (run 2× each variant):**
- eip-712 (60% CU)
- siwe (55% CU)
- erc-721 (45% CU)
- erc-20 (40% CU)

**Tier 3 — High Encoded Preference (run 1× each variant, sanity check):**
- defi-protocol-templates (30% CU)
- solidity-security (25% CU)

### Test Protocol per Run

```
1. Create fresh SE-2 project
2. Record start time
3. [Variant A] Provide SKILL.md content + task prompt
   [Variant B] Provide ONLY task prompt (no skill, no hints)
4. Let agent implement fully
5. Record:
   - Files created/modified (full list)
   - Token usage
   - Wall clock time
   - Build status: `yarn install && yarn next:build`
   - Runtime test: follow "How to Test" steps
6. Score on 6 dimensions
7. Record qualitative notes on failures
```

### Variant B Prompt Rules

The "without skill" prompt must:
- Use natural language only
- NOT mention specific libraries (e.g., "Drizzle", "Neon", "iron-session")
- NOT hint at architecture (e.g., "repository pattern", "middleware")
- NOT provide file paths or SE-2 conventions
- Be a realistic user request

Examples:

| Skill | Variant A Prompt | Variant B Prompt |
|-------|-----------------|-----------------|
| drizzle-neon | (with SKILL.md) "Add a database to store user profiles..." | "I need a database for my dApp to store user profiles with wallet addresses. I should be able to create and list users from the frontend." |
| subgraph | (with SKILL.md) "Set up event indexing for GreetingChange..." | "I want to index my contract events so I can query historical data with GraphQL." |
| x402 | (with SKILL.md) "Monetize an API endpoint with micropayments..." | "I want users to pay a small crypto fee to access my API endpoint." |
| siwe | (with SKILL.md) "Add wallet-based authentication..." | "Add login to my dApp. Users should authenticate with their wallet." |

---

## Report Template

Generate one report per skill using this structure:

```markdown
# Skill Eval Report: {skill-name}

Date: YYYY-MM-DD
Model: claude-opus-4-6
SE-2 version: {version from package.json}

## Classification Summary
- **Total instructions analyzed:** N
- **Capability Uplift:** X (Y%)
- **Encoded Preference:** Z (W%)
- **Primary value type:** [Capability Uplift | Encoded Preference | Mixed]

## Classification Breakdown
| Instruction | Type | Reasoning |
|-------------|------|-----------|
| ... | ... | ... |

## A/B Test Results

### Test A (WITH skill) — Run {1,2,3}
- **Task prompt used:** "..."
- **Files created:** [list]
- **Build status:** Pass/Fail (error details)
- **Scores:**
  - Correctness: X/3
  - SE-2 Integration: X/3
  - Completeness: X/3
  - Consistency: X/3
  - Gotcha Avoidance: X/3
  - Developer Experience: X/3
- **Weighted Score:** X.XX/3.00
- **Token usage:** ~Xk tokens
- **Time to complete:** ~Xmin

### Test B (WITHOUT skill) — Run {1,2,3}
- **Task prompt used:** "..."
- **Files created:** [list]
- **Build status:** Pass/Fail (error details)
- **Scores:**
  - Correctness: X/3
  - SE-2 Integration: X/3
  - Completeness: X/3
  - Consistency: X/3
  - Gotcha Avoidance: X/3
  - Developer Experience: X/3
- **Weighted Score:** X.XX/3.00
- **Token usage:** ~Xk tokens
- **Time to complete:** ~Xmin

## Delta Analysis

### What the skill added (model couldn't do without):
- ...

### What the model got right without the skill:
- ...

### Where the model went wrong without the skill:
- ...

### Where the model went wrong even WITH the skill:
- ...

### Consistency Analysis (across 3 runs)
- Variant A consistency: [High/Medium/Low] — [notes]
- Variant B consistency: [High/Medium/Low] — [notes]

## Recommendations

### Keep (high capability uplift):
- Sections that are genuinely necessary

### Trim (model already knows):
- Sections restating common knowledge

### Add (gaps found):
- Missing content that caused issues

### Rewrite (confusing):
- Sections where the agent misinterpreted instructions

## Verdict
- **Skill value:** [Essential | Valuable | Marginal | Unnecessary]
- **Confidence:** [High | Medium | Low]
- **Recommended action:** [Keep as-is | Trim | Major rewrite | Deprecate]
```

---

## Expected Outcomes by Skill

Based on classification analysis, predicted deltas:

| Skill | Predicted A vs B Delta | Key Differentiator |
|-------|----------------------|-------------------|
| subgraph | **Large** | ABI copy bridge, Docker config, AssemblyScript gotchas — model cannot know any of this |
| x402 | **Large** | v2 API is too new for training data; model will use wrong/old API |
| ponder | **Large** | Ponder API changed significantly; SE-2 bridge config is custom |
| eip-5792 | **Large** | Wallet capability detection, fallback patterns — model likely has outdated info |
| drizzle-neon | **Medium-Large** | Tri-driver pattern is unique; but model knows Drizzle basics |
| siwe | **Medium** | Model knows SIWE but will likely install wrong package and miss edge cases |
| eip-712 | **Medium** | Model knows EIP-712 but may miss SE-2 integration specifics |
| erc-721 | **Small-Medium** | Model knows NFTs well; skill adds OZ v5 specifics and on-chain SVG |
| erc-20 | **Small** | Model knows ERC-20 very well; skill mainly adds safety gotchas |
| defi-protocol-templates | **Small** | Model knows DeFi patterns; skill is mostly a curated reference |
| solidity-security | **Minimal** | Model's security knowledge is already strong; skill is a checklist |

---

## Automation with /skill-creator

For skills that support it, use the `/skill-creator` eval infrastructure:

```
/skill-creator benchmark {skill-name}
```

This runs:
1. Multiple eval prompts in parallel (independent agents, clean contexts)
2. Tracks pass rate, elapsed time, token usage
3. Supports comparator mode (skill vs no-skill, or v1 vs v2)

For skills without automated evals, create eval files at `.agents/skills/{skill-name}/evals/`:

```yaml
# .agents/skills/drizzle-neon/evals/basic.yaml
name: "Basic database integration"
prompt: "Add a database to store user profiles with wallet addresses"
expected:
  files_created:
    - packages/nextjs/services/database/config/postgresClient.ts
    - packages/nextjs/services/database/config/schema.ts
    - packages/nextjs/drizzle.config.ts
    - docker-compose.yml
  build_passes: true
  contains_patterns:
    - "casing.*snake_case"
    - "@neondatabase/serverless"
    - "drizzle-orm"
```

---

## Next Steps

1. Start with **Tier 1 skills** (subgraph, x402, ponder, eip-5792, drizzle-neon)
2. Run 3× A/B tests per skill
3. Generate reports
4. Use findings to trim/improve skills
5. Re-run evals after improvements to measure lift
6. Set up CI-triggered evals for model updates (capability saturation detection)
