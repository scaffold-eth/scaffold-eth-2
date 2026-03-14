# Ponder Event Indexing Implementation Summary

## What Was Built

A full Ponder integration for Scaffold-ETH 2 that indexes `GreetingChange` events from the `YourContract` smart contract and exposes them via a GraphQL API. A frontend page displays the indexed events in a table with auto-refresh.

## Architecture

- **Ponder indexer** (`packages/ponder/`): A new workspace that reads SE-2's `deployedContracts` and `scaffold.config` to automatically discover contracts and their ABIs. It indexes `GreetingChange` events and stores them in a `greeting_change` table.
- **GraphQL API**: Served by Ponder at `http://localhost:42069/graphql` using Hono, exposing the indexed greeting change data.
- **Frontend page** (`/events`): A Next.js page that queries the Ponder GraphQL API using `graphql-request` and `@tanstack/react-query`, displaying events in a table with setter address, greeting text, premium status, ETH value, block number, and timestamp.

## Files Created

1. **`packages/ponder/package.json`** - Ponder workspace package definition (`@se-2/ponder`) with all necessary dependencies (ponder, hono, viem) and scripts (dev, start, codegen, serve, etc.).

2. **`packages/ponder/ponder.config.ts`** - Ponder configuration that dynamically reads SE-2's `deployedContracts` and `scaffold.config` to build the indexer config. Automatically picks up all deployed contracts and the target network's RPC URL.

3. **`packages/ponder/ponder.schema.ts`** - Schema definition with a `greeting_change` onchainTable containing fields: id, greetingSetter (hex), newGreeting (text), premium (boolean), value (bigint), timestamp (integer), blockNumber (bigint).

4. **`packages/ponder/src/YourContract.ts`** - Event handler that listens for `YourContract:GreetingChange` events and inserts records into the `greeting_change` table with all event args plus block metadata.

5. **`packages/ponder/src/api/index.ts`** - Hono-based API that serves a GraphQL endpoint at `/graphql`, automatically exposing the schema tables as queryable entities.

6. **`packages/ponder/ponder-env.d.ts`** - TypeScript declarations for Ponder's virtual modules (`ponder:registry`, `ponder:schema`, `ponder:api`).

7. **`packages/ponder/tsconfig.json`** - TypeScript config with `moduleResolution: "bundler"`, `module: "ESNext"`, `target: "ES2022"`.

8. **`packages/ponder/.gitignore`** - Ignores `node_modules`, `.ponder`, `/generated/`, `dist`.

9. **`packages/ponder/.env.example`** - Environment variable template for RPC URL, database schema, and optional Postgres URL.

10. **`packages/nextjs/app/events/page.tsx`** - Frontend page that fetches greeting change events from Ponder's GraphQL API and displays them in a DaisyUI table. Shows setter address (using SE-2's `Address` component), greeting text, premium badge, ETH value, block number, and formatted timestamp. Auto-refreshes every 5 seconds.

## Files Modified

11. **`package.json`** (root) - Added `packages/ponder` to workspaces array. Added `ponder:dev`, `ponder:start`, `ponder:codegen`, `ponder:serve`, `ponder:lint`, `ponder:typecheck` scripts.

12. **`packages/nextjs/package.json`** - Added `graphql` (^16.9.0) and `graphql-request` (^7.1.0) dependencies for querying the Ponder GraphQL API.

13. **`packages/nextjs/components/Header.tsx`** - Added "Events" navigation link with `MagnifyingGlassIcon` to the header menu, pointing to `/events`.

## How to Use

1. Start the local blockchain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Start Ponder indexer: `yarn ponder:dev`
4. Start the frontend: `yarn start`
5. Visit `http://localhost:3000/events` to see indexed events
6. Use the Debug Contracts page to call `setGreeting` and watch events appear
7. GraphiQL explorer available at `http://localhost:42069` for testing queries
