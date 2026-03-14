# Ponder Event Indexing Implementation

## Task

Set up a Ponder indexer for the SE-2 YourContract smart contract to index `GreetingChange` events and expose them via a GraphQL API.

## What Was Done

### 1. Ponder Package (`packages/ponder/`)

Created a complete Ponder workspace with the following files:

- **`package.json`** - Workspace package (`@se-2/ponder`) with ponder, hono, and viem dependencies, plus dev/start/codegen/serve scripts.
- **`ponder.config.ts`** - Reads `deployedContracts` and `scaffold.config` from the nextjs package to dynamically configure chains and contracts. Falls back to `http://127.0.0.1:8545` for local development.
- **`ponder.schema.ts`** - Defines a `greeting_change` onchain table with columns matching the `GreetingChange` event parameters: `greetingSetter` (hex), `newGreeting` (text), `premium` (boolean), `value` (bigint), `timestamp` (integer), `blockNumber` (bigint).
- **`src/YourContract.ts`** - Event handler that listens for `YourContract:GreetingChange` events and inserts them into the `greetingChange` table.
- **`src/api/index.ts`** - Hono-based API that exposes a `/graphql` endpoint using Ponder's built-in GraphQL middleware.
- **`tsconfig.json`** - TypeScript config with `moduleResolution: "bundler"`, `module: "ESNext"`, `target: "ES2022"`.
- **`ponder-env.d.ts`** - Type declarations for Ponder virtual modules.
- **`.gitignore`** - Ignores `node_modules`, `.ponder`, `/generated/`, `.env`, `.env.local`.
- **`.env.example`** - Reference environment variables for RPC URL and database config.

### 2. Root Package Modifications (`package.json`)

- Added `packages/ponder` to the `workspaces.packages` array.
- Added six `ponder:*` scripts: `ponder:dev`, `ponder:start`, `ponder:codegen`, `ponder:serve`, `ponder:lint`, `ponder:typecheck`.

### 3. NextJS Package Modifications

- **`packages/nextjs/package.json`** - Added `graphql` (^16.9.0) and `graphql-request` (^7.1.0) dependencies.
- **`packages/nextjs/app/events/page.tsx`** - New page that queries the Ponder GraphQL API for `greetingChanges`, displays them in a table with greeting text, setter address (using `Address` component), premium badge, ETH value, block number, and timestamp. Includes auto-refresh (10s polling), manual refresh button, loading/error/empty states.
- **`packages/nextjs/components/Header.tsx`** - Added "Events" navigation link with `MagnifyingGlassIcon` to the header menu.

## How to Run

1. Start local chain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Start Ponder indexer: `yarn ponder:dev` (serves GraphQL at `http://localhost:42069`)
4. Start frontend: `yarn start`
5. Navigate to `/events` to see indexed greeting events
6. Use the Debug Contracts page to call `setGreeting` and watch events appear

## Files Created

| File | Purpose |
|------|---------|
| `packages/ponder/package.json` | Ponder workspace package config |
| `packages/ponder/ponder.config.ts` | Ponder config bridging SE-2 contracts |
| `packages/ponder/ponder.schema.ts` | Onchain table schema for GreetingChange |
| `packages/ponder/src/YourContract.ts` | Event handler for GreetingChange |
| `packages/ponder/src/api/index.ts` | GraphQL API endpoint |
| `packages/ponder/tsconfig.json` | TypeScript configuration |
| `packages/ponder/ponder-env.d.ts` | Virtual module type declarations |
| `packages/ponder/.gitignore` | Git ignore rules |
| `packages/ponder/.env.example` | Environment variable reference |
| `packages/nextjs/app/events/page.tsx` | Frontend events display page |

## Files Modified

| File | Change |
|------|--------|
| `package.json` (root) | Added ponder workspace and scripts |
| `packages/nextjs/package.json` | Added graphql and graphql-request deps |
| `packages/nextjs/components/Header.tsx` | Added Events nav link |
