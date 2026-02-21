---
name: ponder
description: "Integrate Ponder into a Scaffold-ETH 2 project for blockchain event indexing. Use when the user wants to: index contract events, add a blockchain backend, set up GraphQL for onchain data, use Ponder with SE-2, or build an indexer for their dApp."
---

# Ponder Integration for Scaffold-ETH 2

## Prerequisites

This skill is designed for Scaffold-ETH 2 (SE-2) projects. If the user is **not already inside an SE-2 project**, use the `ethereum-app-builder` skill from this same skill package to scaffold one first, then come back here to add Ponder.

How to check: look for `packages/nextjs/` and either `packages/hardhat/` or `packages/foundry/` in the project root, along with a root `package.json` with SE-2 workspace scripts (`yarn chain`, `yarn deploy`, `yarn start`).

## Overview

[Ponder](https://ponder.sh/) is an open-source framework for blockchain application backends. It indexes smart contract events and serves the data via a GraphQL API. This skill covers integrating Ponder into a Scaffold-ETH 2 (SE-2) project.

For anything not covered here, refer to the [Ponder docs](https://ponder.sh/docs/get-started) or search the web. This skill provides the SE-2-specific integration knowledge, not a complete Ponder reference.

## SE-2 Project Context

Scaffold-ETH 2 (SE-2) is a yarn (v3) monorepo for building dApps on Ethereum. It comes in two flavors based on the Solidity framework:

- **Hardhat flavor**: contracts at `packages/hardhat/contracts/`, deploy scripts at `packages/hardhat/deploy/`
- **Foundry flavor**: contracts at `packages/foundry/contracts/`, deploy scripts at `packages/foundry/script/`

Check which exists in the project to know the flavor. Both flavors share:

- **`packages/nextjs/`**: React frontend (Next.js App Router, Tailwind + DaisyUI, RainbowKit, Wagmi, Viem). Uses `~~` path alias for imports.
- **`packages/nextjs/contracts/deployedContracts.ts`**: auto-generated after `yarn deploy`, contains ABIs, addresses, and deployment block numbers for all contracts, keyed by chain ID.
- **`packages/nextjs/scaffold.config.ts`**: project config including `targetNetworks` (array of viem chain objects).
- **Root `package.json`**: monorepo scripts that proxy into workspaces (e.g. `yarn chain`, `yarn deploy`, `yarn start`).

Ponder gets added as a new workspace at `packages/ponder/`. The key integration point is that Ponder reads `deployedContracts` and `scaffold.config` from the nextjs package, so it automatically knows about all deployed contracts without duplicating ABIs or addresses.

Look at the actual project structure and contracts before setting things up. Adapt to what's there rather than following this skill rigidly.

## Dependencies & Scripts

### Ponder package (`packages/ponder/`)

The `packages/ponder/package.json` should follow SE-2's workspace naming convention (`@se-2/ponder`). Reference structure with minimum version requirements. Check [npm](https://www.npmjs.com/package/ponder) or the [Ponder docs](https://ponder.sh/docs/requirements) for the latest versions before installing:

```json
{
  "name": "@se-2/ponder",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "ponder dev",
    "start": "ponder start",
    "db": "ponder db",
    "codegen": "ponder codegen",
    "serve": "ponder serve",
    "lint": "eslint .",
    "typecheck": "tsc"
  },
  "dependencies": {
    "ponder": "latest",
    "hono": "^4.5.0",
    "viem": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "eslint": "^8.54.0",
    "eslint-config-ponder": "latest",
    "typescript": "^5.0.4"
  },
  "engines": {
    "node": ">=18.18"
  }
}
```

> **Note:** `ponder` and `eslint-config-ponder` versions should match. Use `latest` or check the [releases](https://github.com/ponder-sh/ponder/releases) for the current stable version.

### NextJS package additions

These are needed in `packages/nextjs/` for querying Ponder's GraphQL API from the frontend:

```json
{
  "graphql": "^16.9.0",
  "graphql-request": "^7.1.0"
}
```

### Root package.json scripts

Wire up workspace commands so they're accessible from the monorepo root:

```json
{
  "ponder:dev": "yarn workspace @se-2/ponder dev",
  "ponder:start": "yarn workspace @se-2/ponder start",
  "ponder:codegen": "yarn workspace @se-2/ponder codegen",
  "ponder:serve": "yarn workspace @se-2/ponder serve",
  "ponder:lint": "yarn workspace @se-2/ponder lint",
  "ponder:typecheck": "yarn workspace @se-2/ponder typecheck"
}
```

### Environment variables

A `.env.example` in `packages/ponder/` for reference:

```
# RPC URL for the target chain (replace {chainId} with actual chain ID, e.g. PONDER_RPC_URL_1 for mainnet)
PONDER_RPC_URL_{chainId}=

# Database schema name
DATABASE_SCHEMA=my_schema

# (Optional) Postgres database URL. If not provided, PGlite (embedded Postgres) will be used.
DATABASE_URL=
```

The frontend uses `NEXT_PUBLIC_PONDER_URL` to know where the Ponder API lives (defaults to `http://localhost:42069` in dev).

## Ponder Package Configuration

### ponder.config.ts - bridging SE-2 and Ponder

The config needs to read SE-2's deployed contracts and scaffold config so Ponder is aware of what to index. Here's a reference implementation that dynamically builds the Ponder config from SE-2's data. Adapt it based on the project's actual setup (e.g., if multiple networks are needed, or if contracts should be filtered):

```ts
import { createConfig } from "ponder";
import deployedContracts from "../nextjs/contracts/deployedContracts";
import scaffoldConfig from "../nextjs/scaffold.config";

const targetNetwork = scaffoldConfig.targetNetworks[0];

const deployedContractsForNetwork = deployedContracts[targetNetwork.id];
if (!deployedContractsForNetwork) {
  throw new Error(`No deployed contracts found for network ID ${targetNetwork.id}`);
}

const chains = {
  [targetNetwork.name]: {
    id: targetNetwork.id,
    rpc: process.env[`PONDER_RPC_URL_${targetNetwork.id}`] || "http://127.0.0.1:8545",
  },
};

const contractNames = Object.keys(deployedContractsForNetwork);

const contracts = Object.fromEntries(contractNames.map((contractName) => {
  return [contractName, {
    chain: targetNetwork.name as string,
    abi: deployedContractsForNetwork[contractName].abi,
    address: deployedContractsForNetwork[contractName].address,
    startBlock: deployedContractsForNetwork[contractName].deployedOnBlock || 0,
  }];
}));

export default createConfig({
  chains: chains,
  contracts: contracts,
});
```

### Schema definition

The schema in `ponder.schema.ts` should reflect the project's actual contract events. Look at what events the deployed contracts emit and design tables to capture that data. Each `onchainTable` defines a table that Ponder populates during indexing.

Solidity-to-Ponder type reference:

| Solidity | Ponder | TS type |
|----------|--------|---------|
| `address` | `t.hex()` | `` `0x${string}` `` |
| `uint256` / `int256` | `t.bigint()` | `bigint` |
| `string` | `t.text()` | `string` |
| `bool` | `t.boolean()` | `boolean` |
| `bytes` / `bytes32` | `t.hex()` | `` `0x${string}` `` |
| `uint8` / `uint32` etc. | `t.integer()` | `number` |

Additional column types: `t.real()` (floats), `t.timestamp()` (Date), `t.json()` (arbitrary JSON). Columns support modifiers: `.primaryKey()`, `.notNull()`, `.default(value)`, `.array()`. See [schema docs](https://ponder.sh/docs/schema/tables) for the full API including composite primary keys, indexes, and enums.

Syntax example (for a greeting event, your schema will differ based on the actual contracts):

```ts
import { onchainTable } from "ponder";

export const greeting = onchainTable("greeting", (t) => ({
  id: t.text().primaryKey(),
  text: t.text().notNull(),
  setterId: t.hex().notNull(),
  premium: t.boolean().notNull(),
  value: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
}));
```

### Event handlers

Handlers go in `packages/ponder/src/` and define what happens when contract events are detected. Look at the project's contracts to decide which events matter and what data to extract. The handler name format is `"ContractName:EventName"`, where `ContractName` matches the key in `deployedContracts`.

Syntax example:

```ts
import { ponder } from "ponder:registry";
import { greeting } from "ponder:schema";

ponder.on("YourContract:GreetingChange", async ({ event, context }) => {
  await context.db.insert(greeting).values({
    id: event.id,
    text: event.args.newGreeting,
    setterId: event.args.greetingSetter,
    premium: event.args.premium,
    value: event.args.value,
    timestamp: Number(event.block.timestamp),
  });
});
```

### GraphQL API

Ponder serves data via a Hono-based API. This is mostly boilerplate. A minimal `packages/ponder/src/api/index.ts`:

```ts
import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { graphql } from "ponder";

const app = new Hono();

app.use("/graphql", graphql({ db, schema }));

export default app;
```

Custom API routes can be added to this Hono app if GraphQL alone isn't sufficient. See [Ponder API docs](https://ponder.sh/docs/query/api-endpoints).

### Boilerplate files

These are standard Ponder project files, nothing SE-2-specific, just needed for Ponder to work:

- **`ponder-env.d.ts`**: type declarations for Ponder's virtual modules (`ponder:registry`, `ponder:schema`, `ponder:api`, etc.)
- **`tsconfig.json`**: standard strict TS config with `moduleResolution: "bundler"`, `module: "ESNext"`, `target: "ES2022"`
- **`.gitignore`**: should include `node_modules`, `.ponder`, `/generated/`

## SE-2 Integration

### Header navigation

The SE-2 header has a menu links array. Add a navigation tab for the Ponder page. Pick an appropriate icon from `@heroicons/react/24/outline` that fits the context of data indexing.

### Frontend page

The frontend needs a page to display Ponder-indexed data. Use `graphql-request` and `@tanstack/react-query` (both available in SE-2) to query the Ponder API. The GraphQL query shape depends on what you defined in `ponder.schema.ts`. Ponder auto-generates queries from your schema, with each `onchainTable` getting a pluralized query with `items`, `orderBy`, and `orderDirection` support.

Fetch pattern for reference:

```tsx
const fetchData = async () => {
  const query = gql`
    query {
      greetings(orderBy: "timestamp", orderDirection: "desc") {
        items { id text setterId premium value timestamp }
      }
    }
  `;
  return request(
    `${process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069"}/graphql`,
    query,
  );
};

// In component:
const { data } = useQuery({ queryKey: ["ponder-data"], queryFn: fetchData });
```

Build out the UI based on the indexed data and the project's existing patterns. SE-2 uses `@scaffold-ui/components` for blockchain/Ethereum components (addresses, balances, etc.) and DaisyUI + Tailwind for general component and styling. Whether this is a new page or integrated into an existing one depends on the project.

## Development & Deployment

- `yarn ponder:dev` starts the dev server with hot reload. GraphiQL explorer available at `http://localhost:42069` for testing queries interactively.
- For production deployment, see [Ponder deployment docs](https://ponder.sh/docs/production/railway). Key things: set `PONDER_RPC_URL_{chainId}` with a production RPC, optionally configure `DATABASE_URL` for Postgres (defaults to PGlite in dev), and point the frontend's `NEXT_PUBLIC_PONDER_URL` to the deployed Ponder URL.
