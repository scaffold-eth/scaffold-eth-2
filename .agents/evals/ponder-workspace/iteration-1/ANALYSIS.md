# ponder -- Event Indexing: Detailed Analysis

## Score: 100% with skill | 50% without skill | Delta: +50%

## Efficiency

| Metric | With Skill | Without Skill | Diff |
|--------|-----------|---------------|------|
| Time | 155s (2m 35s) | 213s (3m 33s) | -58s (27% faster) |
| Tokens | 34,966 | 42,728 | -7,762 (18% cheaper) |
| Tool calls | 35 | 50 | -15 (30% fewer) |

**Fastest skill overall** -- both with-skill (155s) and without-skill (213s) were the quickest of all 4 evals. Ponder has a relatively contained scope (indexer package + config + handlers + API), which kept both runs lean.

## Assertion Breakdown

### Passed in both variants (non-discriminating)
These 5 assertions passed regardless of skill presence:

1. **Package named @se-2/ponder** -- The model correctly followed SE-2 workspace naming. This suggests workspace naming conventions are well-understood even without the skill.
2. **onchainTable schema API** -- Both variants used `onchainTable` (the current Ponder schema API). The model knows this pattern, though the without-skill variant imported it from `@ponder/core` (old package name) rather than `ponder` (current).
3. **ContractName:EventName handler format** -- Both variants used the `'YourContract:GreetingChange'` format correctly. This pattern is stable across Ponder versions.
4. **context.db.insert().values() for writes** -- Both variants used the correct insert API. Database write patterns in Ponder have remained consistent.
5. **Root proxy scripts** -- Both variants added ponder commands to the root package.json.

### Failed without skill (discriminating -- skill provides Capability Uplift)
These 5 assertions are where the skill made the difference:

1. **Config reads deployedContracts from SE-2** -- This is the most important SE-2 bridge pattern. With the skill, the ponder config imports `deployedContracts` from `'../nextjs/contracts/deployedContracts'` and dynamically extracts ABI and address. Without the skill, the model **hardcoded** the ABI into a local `abis/YourContract.ts` file and hardcoded the contract address as `'0x5FbDB2315678afecb367f032d93F642f64180aa3'`. This means: every time the contract is redeployed, the Ponder config must be manually updated. The entire point of SE-2's deployedContracts is to avoid this.

2. **Config reads scaffoldConfig for network** -- Same bridge pattern for network detection. With the skill, the config reads `scaffoldConfig.targetNetworks[0]` for dynamic chain configuration. Without the skill, the model hardcoded `chainId: 31337` and `'localhost'` -- making it impossible to switch networks without editing the Ponder config.

3. **Virtual module imports (ponder:registry, ponder:schema, ponder:api)** -- Ponder v0.7+ introduced virtual modules as the import mechanism. With the skill: `import { ponder } from 'ponder:registry'`. Without the skill: `import { ponder } from '@/generated'` -- this is the **pre-v0.7 import style** that no longer works. The model's training data contains the older pattern.

4. **Hono-based API (not express-style)** -- Ponder v0.7+ switched from express-style (`ponder.use('/graphql', graphql())`) to Hono (`const app = new Hono(); app.use('/graphql', graphql({db, schema}))`). Without the skill, the model used the old express-style API that doesn't exist in current Ponder.

5. **ponder-env.d.ts exists** -- This TypeScript declaration file enables type checking for Ponder's virtual module imports. Without it, TypeScript can't resolve `ponder:registry`, `ponder:schema`, etc. The model didn't create this file, which would cause TypeScript errors across the entire Ponder package.

## Root Cause Analysis

Ponder has the classic **version boundary** problem. The model's training data contains Ponder knowledge, but it straddles the v0.7 release:

| Pattern | Pre-v0.7 (model's knowledge) | v0.7+ (current) |
|---------|------------------------------|-----------------|
| Package name | `@ponder/core` | `ponder` |
| Imports | `@/generated` file imports | `ponder:registry` virtual modules |
| API style | Express-style `ponder.use()` | Hono `new Hono()` |
| Type declarations | Not needed | `ponder-env.d.ts` required |

The model gets the *concepts* right (onchainTable, event handlers, insert patterns) because those are stable across versions. But the *wiring* (imports, API setup, package name) changed in v0.7, and the model is stuck on the old side.

Separately, the SE-2 bridge (deployedContracts + scaffoldConfig) is a custom integration pattern that doesn't exist in any Ponder documentation. The model can't know about it because it was invented specifically for SE-2.

## Key Takeaway

ponder demonstrates both the **stale API version** pattern (wrong package name, old imports, express vs Hono) and the **missing SE-2 bridge** pattern (hardcoded ABI/address instead of reading deployedContracts). The 50% delta breaks down cleanly: ~30% from version issues, ~20% from SE-2 integration. The skill solves both by providing current API patterns AND the SE-2 bridge code.
