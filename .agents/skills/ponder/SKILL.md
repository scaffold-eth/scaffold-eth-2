---
name: ponder
description: "Integrate Ponder into a Scaffold-ETH 2 project for blockchain event indexing. Use when the user wants to: index contract events, add a blockchain backend, set up GraphQL for onchain data, use Ponder with SE-2, or build an indexer for their dApp."
---

# Ponder Integration for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Overview

[Ponder](https://ponder.sh/) is an open-source framework for blockchain application backends. It indexes smart contract events and serves the data via a GraphQL API. This skill covers integrating Ponder into a Scaffold-ETH 2 (SE-2) project.

For anything not covered here, refer to the [Ponder docs](https://ponder.sh/docs/get-started) or search the web. This skill provides the SE-2-specific integration knowledge, not a complete Ponder reference.

Ponder gets added as a new workspace at `packages/ponder/`. The key integration point is that Ponder reads `deployedContracts` and `scaffold.config` from the nextjs package, so it automatically knows about all deployed contracts without duplicating ABIs or addresses.

Look at the actual project structure and contracts before setting things up. Adapt to what's there rather than following this skill rigidly.

## Dependencies & Scripts

### Ponder package (`packages/ponder/`)

The `packages/ponder/package.json` should follow SE-2's workspace naming convention (`@se-2/ponder`). Check [npm](https://www.npmjs.com/package/ponder) or the [Ponder docs](https://ponder.sh/docs/requirements) for the latest versions before installing:

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

### NextJS package additions

For querying Ponder's GraphQL API from the frontend, add to `packages/nextjs/`:

```json
{
  "graphql": "^16.9.0",
  "graphql-request": "^7.1.0"
}
```

### Root package.json scripts

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
PONDER_RPC_URL_{chainId}=
DATABASE_SCHEMA=my_schema
DATABASE_URL=
```

The frontend uses `NEXT_PUBLIC_PONDER_URL` to know where the Ponder API lives (defaults to `http://localhost:42069` in dev).

## ponder.config.ts — Bridging SE-2 and Ponder

This is the critical integration piece. The config below is a reference implementation that dynamically reads SE-2's deployed contracts and scaffold config so Ponder automatically knows what to index. Adapt it based on the project's actual setup:

```ts
import { createConfig } from "ponder";
import deployedContracts from "../nextjs/contracts/deployedContracts";
import scaffoldConfig from "../nextjs/scaffold.config";

const targetNetwork = scaffoldConfig.targetNetworks[0];

const deployedContractsForNetwork = deployedContracts[targetNetwork.id];
if (!deployedContractsForNetwork) {
  throw new Error(
    `No deployed contracts found for network ID ${targetNetwork.id}`,
  );
}

const chains = {
  [targetNetwork.name]: {
    id: targetNetwork.id,
    rpc:
      process.env[`PONDER_RPC_URL_${targetNetwork.id}`] ||
      "http://127.0.0.1:8545",
  },
};

const contractNames = Object.keys(deployedContractsForNetwork);

const contracts = Object.fromEntries(
  contractNames.map((contractName) => {
    return [
      contractName,
      {
        chain: targetNetwork.name as string,
        abi: deployedContractsForNetwork[contractName].abi,
        address: deployedContractsForNetwork[contractName].address,
        startBlock:
          deployedContractsForNetwork[contractName].deployedOnBlock || 0,
      },
    ];
  }),
);

export default createConfig({
  chains: chains,
  contracts: contracts,
});
```

## Schema, Handlers, and API

### Schema (`ponder.schema.ts`)

Use `onchainTable` to define tables. Adapt to the project's actual contract events:

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

For the full schema API (column types, indexes, enums), see [Ponder schema docs](https://ponder.sh/docs/schema/tables).

### Event handlers (`src/`)

Use Ponder's virtual module imports. Handler name format is `"ContractName:EventName"`:

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

### GraphQL API (`src/api/index.ts`)

Ponder serves data via Hono. Minimal setup:

```ts
import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { graphql } from "ponder";

const app = new Hono();

app.use("/graphql", graphql({ db, schema }));

export default app;
```

### Required boilerplate

- **`ponder-env.d.ts`**: type declarations for Ponder's virtual modules (`ponder:registry`, `ponder:schema`, `ponder:api`, etc.). Without this, TypeScript won't resolve the virtual imports.
- **`tsconfig.json`**: strict TS config with `moduleResolution: "bundler"`, `module: "ESNext"`, `target: "ES2022"`
- **`.gitignore`**: include `node_modules`, `.ponder`, `/generated/`

## Frontend

Use `graphql-request` and `@tanstack/react-query` (both available in SE-2) to query the Ponder API. Ponder auto-generates GraphQL queries from your schema — each `onchainTable` gets a pluralized query with `items`, `orderBy`, and `orderDirection` support:

```tsx
import { gql, request } from "graphql-request";
import { useQuery } from "@tanstack/react-query";

const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

const { data } = useQuery({
  queryKey: ["ponder-greetings"],
  queryFn: () => request(`${PONDER_URL}/graphql`, gql`{
    greetings(orderBy: "timestamp", orderDirection: "desc") {
      items { id text setterId premium value timestamp }
    }
  }`),
});
```

## Development & Production

- `yarn ponder:dev` starts the dev server with hot reload. GraphiQL explorer available at `http://localhost:42069` for testing queries interactively.
- For production, set `PONDER_RPC_URL_{chainId}` with a production RPC, optionally configure `DATABASE_URL` for Postgres (defaults to PGlite in dev), and point `NEXT_PUBLIC_PONDER_URL` to the deployed Ponder URL. See [Ponder deployment docs](https://ponder.sh/docs/production/railway).
