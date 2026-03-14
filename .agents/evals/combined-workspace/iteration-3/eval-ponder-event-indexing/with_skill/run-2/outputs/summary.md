# Ponder Event Indexing for YourContract GreetingChange Events

## What was built

A complete Ponder indexer integration for Scaffold-ETH 2 that indexes `GreetingChange` events emitted by the `YourContract` smart contract and exposes them via a GraphQL API. A frontend page displays the indexed events in a table with auto-refresh.

The `GreetingChange` event has the following fields:
- `greetingSetter` (address, indexed) - the address that set the greeting
- `newGreeting` (string) - the new greeting text
- `premium` (bool) - whether ETH was sent with the transaction
- `value` (uint256) - the amount of ETH sent

## Files created

### Ponder package (`packages/ponder/`)

1. **`packages/ponder/package.json`** - Package definition with `@se-2/ponder` workspace name, Ponder + Hono + Viem dependencies, and dev/start/codegen/serve scripts.

2. **`packages/ponder/ponder.config.ts`** - Ponder configuration that dynamically reads SE-2's `deployedContracts` and `scaffold.config` to auto-discover all deployed contracts, their ABIs, addresses, and target chain. Falls back to `http://127.0.0.1:8545` for local development RPC.

3. **`packages/ponder/ponder.schema.ts`** - Schema definition with a `greeting_change` onchainTable containing fields: `id` (text, PK), `greetingSetter` (hex), `newGreeting` (text), `premium` (boolean), `value` (bigint), `timestamp` (integer), `blockNumber` (bigint).

4. **`packages/ponder/src/YourContract.ts`** - Event handler that listens for `YourContract:GreetingChange` events and inserts records into the `greeting_change` table with all event args plus block timestamp and number.

5. **`packages/ponder/src/api/index.ts`** - Hono-based API that serves a GraphQL endpoint at `/graphql`, auto-generated from the schema.

6. **`packages/ponder/ponder-env.d.ts`** - TypeScript declarations for Ponder's virtual modules (`ponder:registry`, `ponder:schema`, `ponder:api`).

7. **`packages/ponder/tsconfig.json`** - TypeScript config with `ES2022` target, `ESNext` module, `bundler` module resolution.

8. **`packages/ponder/.gitignore`** - Ignores `node_modules`, `.ponder`, `/generated/`.

9. **`packages/ponder/.env.example`** - Environment variable template for RPC URL, database schema, and optional Postgres URL.

### Frontend additions

10. **`packages/nextjs/app/events/page.tsx`** - New Next.js page that queries the Ponder GraphQL API using `graphql-request` and `@tanstack/react-query`. Displays a table of GreetingChange events with setter address (using SE-2's `Address` component), greeting text, ETH value, premium badge, block number, and timestamp. Auto-refreshes every 5 seconds. Includes loading spinner, error alert, and empty state.

## Files modified

11. **`packages/nextjs/components/Header.tsx`** - Added "Events" navigation link with `MagnifyingGlassIcon` to the header menu, linking to `/events`.

12. **`packages/nextjs/package.json`** - Added `graphql` (^16.9.0) and `graphql-request` (^7.1.0) dependencies for querying Ponder's GraphQL API.

13. **`package.json`** (root) - Added `packages/ponder` to workspaces array. Added `ponder:dev`, `ponder:start`, `ponder:codegen`, `ponder:serve`, `ponder:lint`, `ponder:typecheck` scripts.

## How to run

1. Start the local chain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Install dependencies: `yarn install`
4. Start Ponder indexer: `yarn ponder:dev` (serves GraphQL at http://localhost:42069)
5. Start the frontend: `yarn start`
6. Navigate to the "Events" tab to see indexed GreetingChange events
7. Use the Debug Contracts tab to call `setGreeting` and see events appear
