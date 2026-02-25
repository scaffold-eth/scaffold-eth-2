# Extension-to-Skill Migration Prompt

Use this prompt to migrate a create-eth extension (from the `create-eth-extensions` repo) into an SE-2 agent skill (`SKILL.md`).

---

## How to use

1. Copy this entire prompt into a conversation with Claude
2. Replace `{{EXTENSION_NAME}}` with the extension branch name (e.g., `subgraph`, `envio`, `eip-712`)
3. Provide the extension source files (or point Claude at the branch)
4. Claude will produce a `SKILL.md` file ready to place at `.agents/skills/{{EXTENSION_NAME}}/SKILL.md`

---

## Prompt

You are migrating a create-eth extension into an SE-2 agent skill. The goal is to produce a single `SKILL.md` file that teaches an AI agent how to implement this extension's functionality in a Scaffold-ETH 2 project from scratch, without relying on the original extension's file-copying machinery.

### Source material

The extension lives on branch `{{EXTENSION_NAME}}` of the `create-eth-extensions` repo at:
`/Users/shivbhonde/Desktop/github/create-eth/externalExtensions/create-eth-extensions`

To access the source files:
```bash
cd /Users/shivbhonde/Desktop/github/create-eth/externalExtensions/create-eth-extensions
git checkout {{EXTENSION_NAME}}
```

Read **every file** in the `extension/` directory on that branch, including:
- Solidity contracts (both `packages/hardhat/contracts/` and `packages/foundry/contracts/`)
- Deployment scripts (both `packages/hardhat/deploy/` and `packages/foundry/script/`)
- Frontend pages, components, hooks, utils (`packages/nextjs/`)
- `.args.mjs` files (these show what gets merged into existing SE-2 files like `Header.tsx`, `Deploy.s.sol`, `package.json`)
- Any new workspace packages (e.g., `packages/subgraph/`, `packages/ponder/`)
- `README.md.args.mjs` (contains setup instructions)
- `.env.example` or `.env.example.args.mjs` files
- `package.json` at root and workspace levels (for new scripts and dependencies)

Also read the extension's root `README.md` for an overview of what the extension does.

### Target format

Produce a single `SKILL.md` file. No other files. The skill teaches an AI agent everything it needs to implement this feature in an SE-2 project.

### SKILL.md structure

Follow this exact structure. Every section is important.

#### 1. YAML Frontmatter

```yaml
---
name: {{EXTENSION_NAME}}
description: "One sentence describing when to trigger this skill. Start with a verb. Include 4-6 trigger phrases covering different ways a user might ask for this."
---
```

The `description` field is used for skill matching. Make it specific. Example from erc-20:
> "Add an ERC-20 token contract to a Scaffold-ETH 2 project. Use when the user wants to: create a fungible token, deploy an ERC-20, add token minting, build a token transfer UI, or work with ERC-20 tokens in SE-2."

#### 2. Title

```markdown
# {{Feature Name}} Integration for Scaffold-ETH 2
```

#### 3. Prerequisites

Use this exact text (it's identical across all skills):

```markdown
## Prerequisites

This skill is designed for Scaffold-ETH 2 (SE-2) projects. If the user is **not already inside an SE-2 project**, use the `ethereum-app-builder` skill from this same skill package to scaffold one first, then come back here to add {{EXTENSION_NAME}}.

How to check: look for `packages/nextjs/` and either `packages/hardhat/` or `packages/foundry/` in the project root, along with a root `package.json` with SE-2 workspace scripts (`yarn chain`, `yarn deploy`, `yarn start`).
```

#### 4. Overview

- 2-3 sentences explaining what the technology is and why it matters.
- Link to the official docs/website.
- Explicitly state: "This skill focuses on SE-2 integration specifics and gotchas, not a complete reference. For anything not covered here, refer to [official docs link] or search the web."

#### 5. SE-2 Project Context

Use this boilerplate (consistent across all skills), then add 1-2 sentences specific to how this extension integrates:

```markdown
## SE-2 Project Context

Scaffold-ETH 2 (SE-2) is a yarn (v3) monorepo for building dApps on Ethereum. It comes in two flavors based on the Solidity framework:

- **Hardhat flavor**: contracts at `packages/hardhat/contracts/`, deploy scripts at `packages/hardhat/deploy/`
- **Foundry flavor**: contracts at `packages/foundry/contracts/`, deploy scripts at `packages/foundry/script/`

Check which exists in the project to know the flavor. Both flavors share:

- **`packages/nextjs/`**: React frontend (Next.js App Router, Tailwind + DaisyUI, RainbowKit, Wagmi, Viem). Uses `~~` path alias for imports.
- **`packages/nextjs/contracts/deployedContracts.ts`**: auto-generated after `yarn deploy`, contains ABIs, addresses, and deployment block numbers for all contracts, keyed by chain ID.
- **`packages/nextjs/scaffold.config.ts`**: project config including `targetNetworks` (array of viem chain objects).
- **Root `package.json`**: monorepo scripts that proxy into workspaces (e.g. `yarn chain`, `yarn deploy`, `yarn start`).

SE-2 uses `@scaffold-ui/components` for blockchain/Ethereum components (addresses, balances, etc.) and DaisyUI + Tailwind for general component and styling.
```

Then add extension-specific integration context. For example:
- If it adds a new workspace: "Ponder gets added as a new workspace at `packages/ponder/`..."
- If it's contract-only: "The deployment scripts go alongside the existing deploy scripts..."
- If it modifies existing files: explain what gets modified and why.

Always end with: "Look at the actual project structure and contracts before setting things up. Adapt to what's there rather than following this skill rigidly."

#### 6. Dependencies & Scripts (only if the extension adds something)

**Only include this section if the extension actually adds new dependencies, scripts, workspace packages, or environment variables.** If it uses only what SE-2 already provides (OpenZeppelin, wagmi, viem, etc.), skip this section entirely. Don't write "No new dependencies needed" - absence means nothing extra.

When this section IS needed, document only what's new:
- **New npm packages** (and which workspace they go in)
- **New root package.json scripts** (with workspace proxy pattern: `"subgraph:codegen": "yarn workspace @se-2/subgraph codegen"`)
- **New workspace package.json** if it adds a new workspace package (follow SE-2's naming convention: `@se-2/{{name}}`)
- **Environment variables** (with `.env.example` content)

Extract this from the extension's `package.json` files and `.env.example.args.mjs`.

Important: Check npm or official docs for the **latest versions** of packages before hardcoding versions. Use `latest` or provide a minimum version with `^` prefix.

#### 7. Smart Contract (only if the extension adds contracts)

Skip this section if the extension is frontend-only or integration-only. Don't write "No contract changes needed."

When included:
- Show a **syntax reference** contract, not a rigid template. Comment it with "adapt to user's needs."
- Use `>=0.8.0 <0.9.0` pragma unless the extension requires a specific version.
- Note OpenZeppelin import paths and any v5 breaking changes relevant to this domain.
- List available extensions/variations the user might want.
- Extract the contract logic from the extension's Solidity files, but **generalize it** - the skill should teach the pattern, not copy a specific implementation.

#### 8. Deployment (only if contracts are involved)

Skip if no contracts. When included, cover both flavors briefly:

```markdown
## Deployment

### Hardhat

Deploy script goes in `packages/hardhat/deploy/`. SE-2 uses `hardhat-deploy`, so the script exports a `DeployFunction`. Use a filename like `01_deploy_{{name}}.ts` (numbered to control deploy order). The `autoMine` flag speeds up local deployments.

### Foundry

Add a deploy script in `packages/foundry/script/` and wire it into the main `Deploy.s.sol`. SE-2's Foundry setup uses a `ScaffoldETHDeploy` base contract and `DeployHelpers.s.sol`. Import and call the new deploy script from `Deploy.s.sol`'s run function.
```

Only add detail beyond this if the extension has non-standard deployment requirements.

#### 9. Domain-Specific Content (THE CORE)

This is the most important section and varies entirely by extension. This is where you add:

- **The "hard to discover" knowledge** - gotchas, edge cases, non-obvious behaviors
- **Real-world pitfalls** with concrete examples (real exploits, common mistakes)
- **Comparison tables** where relevant (gas costs, feature tradeoffs, well-known addresses)
- **Architecture decisions** the user needs to make (with pros/cons)
- **Configuration specifics** - how config files bridge SE-2 data with the new tool

Guidelines for this section:
- **Teach the pattern, not just the code.** Explain WHY, not just HOW.
- **Use tables** for structured comparisons (type mappings, gas costs, feature matrices).
- **Include version-specific gotchas** (OpenZeppelin v4→v5 changes, library breaking changes).
- **Reference real exploits or incidents** where they add educational value.
- **Link to official docs** for deep dives beyond what you cover.
- **Don't duplicate official docs.** Focus on what's hard to discover and what's specific to SE-2 integration.
- **Verify burner wallet support before claiming it doesn't work.** SE-2's burner wallet (`burner-connector` package) supports more than you'd expect (`eth_signTypedData_v4`, `wallet_sendCalls`, `wallet_getCallsStatus`, etc.). Check the actual implementation at `packages/nextjs/node_modules/burner-connector/dist/esm/burnerConnector/burner.js` before writing gotchas about burner wallet limitations. Only mention a limitation if you've confirmed it in the code.

#### 10. SE-2 Integration

This section should describe **how** the extension's functionality connects to SE-2's frontend, not dictate a rigid page layout. The user may want a dedicated page, or they may want to integrate into an existing page/component. Don't assume either.

```markdown
## SE-2 Integration

### Header navigation

If the user wants a dedicated page, add a nav link to the SE-2 header menu. Pick an appropriate icon from `@heroicons/react/24/outline`.

### Frontend

Describe the key integration patterns — how the extension's data/functionality surfaces in the UI. Don't prescribe a specific page structure. Instead, explain what the user can build and what SE-2 tools are available.
```

Reference SE-2's specific tools (only mention those relevant to this extension):
- **Hooks**: `useScaffoldReadContract`, `useScaffoldWriteContract`, `useScaffoldEventHistory`, `useDeployedContractInfo`, `useScaffoldContract`
- **Components**: `@scaffold-ui/components` (Address, Balance, AddressInput, EtherInput, IntegerInput)
- **Styling**: DaisyUI + Tailwind (not raw Tailwind)
- **Notifications**: `notification` utility from `~~/utils/scaffold-eth`
- **Error handling**: `getParsedError` for readable error messages

**Don't force specific icons, page layouts, or component hierarchies.** The skill should teach the patterns and let the agent adapt to what the user actually needs.

#### 11. Development & Deployment

Brief section on the development workflow:
- What commands to run (using SE-2's `yarn` scripts)
- Any special dev setup (Docker, external services, API keys)
- Production deployment notes if relevant

### Content philosophy

**DO include:**
- Everything an AI agent needs to implement this feature from zero in an SE-2 project
- SE-2-specific integration patterns (hooks, components, file paths, monorepo structure)
- Gotchas that trip up both humans and AI (real-world edge cases, version mismatches, non-obvious behaviors)
- Code examples as **syntax references** with comments like "adapt to the project's actual contracts"
- Tables for structured data (type mappings, comparisons, well-known addresses)
- Links to official documentation for deep dives

**DO NOT include:**
- Complete library API references (link to official docs instead)
- Step-by-step tutorials with rigid orderings (the agent should adapt to the project)
- Boilerplate files verbatim (describe what they need, let the agent generate them)
- The extension's `.args.mjs` merging logic (that's the old system - we're replacing it)
- Unnecessary code comments or JSDoc on simple functions
- **Negative statements about what's NOT needed.** Don't write "No new dependencies required" or "No contract changes needed" - just omit that section entirely. Each skill is loaded independently; the agent assumes nothing extra is needed unless told otherwise. Only mention something if there's an action to take.

### Formatting conventions

- Use ` ```solidity`, ` ```typescript`, ` ```tsx`, ` ```json`, ` ```bash` for code blocks
- **Bold** for emphasis on critical points
- Use tables (`| col | col |`) for comparisons and structured data
- Headers: `##` for major sections, `###` for subsections, `####` for sub-subsections
- Inline code for function names, paths, contract names, package names
- Keep the total length between 150-450 lines (shorter for simple extensions, longer for complex ones like subgraph)

### Quality checklist

Before finalizing, verify:

- [ ] YAML frontmatter has descriptive `name` and `description` with trigger phrases
- [ ] Prerequisites section uses the exact boilerplate
- [ ] SE-2 Project Context section uses the boilerplate + extension-specific additions
- [ ] All SE-2 hooks use correct names (`useScaffoldReadContract` not `useScaffoldContractRead`)
- [ ] Import paths use `~~` alias (e.g., `~~/hooks/scaffold-eth`)
- [ ] Styling mentions DaisyUI, not raw Tailwind
- [ ] Components reference `@scaffold-ui/components`
- [ ] Both Hardhat and Foundry flavors are covered where relevant
- [ ] Code examples are generalized syntax references, not rigid templates
- [ ] Gotchas section exists with real, practical pitfalls
- [ ] Burner wallet claims are verified against actual `burner-connector` source code (don't assume it lacks features)
- [ ] Official docs are linked for anything beyond SE-2 specifics
- [ ] No `.args.mjs` merging logic leaks into the skill
- [ ] The skill reads as a self-contained guide, not a diff or patch
- [ ] "Look at the actual project structure" reminder is included in SE-2 context
- [ ] **No "nothing needed" statements** - sections that don't apply are omitted, not mentioned as absent
- [ ] Every section earns its place - if it doesn't tell the agent to DO something, cut it

### Reference: Extensions available for migration

These branches in `create-eth-extensions` have NOT been migrated yet:

| Branch | Type | Description |
|--------|------|-------------|
| ~~`eip-712`~~ | ~~Frontend/Crypto~~ | ~~EIP-712 typed structured data signing~~ (migrated) |
| `subgraph` | Indexer | The Graph subgraph integration |
| `envio` | Indexer | Envio HyperIndex integration |
| `onchainkit` | Framework | Coinbase OnchainKit integration |
| `randao` | Smart Contract | RANDAO-based random number generation |
| `drizzle-neon` | Database | Drizzle ORM + Neon PostgreSQL integration |
| `porto` | Wallet | Porto wallet integration |
| `x402` | Protocol | x402 payment protocol integration |

Already migrated (for reference, look at their SKILL.md files in `.agents/skills/`):
- `ponder` -> `.agents/skills/ponder/SKILL.md`
- `erc-20` -> `.agents/skills/erc-20/SKILL.md`
- `erc-721` -> `.agents/skills/erc-721/SKILL.md`
- `eip-5792` -> `.agents/skills/eip-5792/SKILL.md`
- `eip-712` -> `.agents/skills/eip-712/SKILL.md`

### Example workflow

```bash
# 1. Check out the extension branch
cd /Users/shivbhonde/Desktop/github/create-eth/externalExtensions/create-eth-extensions
git checkout {{EXTENSION_NAME}}

# 2. Read all files in extension/
find extension/ -type f | head -50

# 3. Read each file to understand the extension's functionality

# 4. Write the SKILL.md
# Output: .agents/skills/{{EXTENSION_NAME}}/SKILL.md

# 5. Register in AGENTS.md
# Add the skill to the Skills & Agents Index section
```
