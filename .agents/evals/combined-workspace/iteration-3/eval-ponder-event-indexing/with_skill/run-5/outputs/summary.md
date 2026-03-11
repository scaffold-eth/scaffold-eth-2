# Ponder Event Indexing for YourContract

## What was built

A Ponder indexer that listens for `GreetingChange` events emitted by the `YourContract` smart contract and exposes the indexed data via a GraphQL API, plus a frontend page to display the events.

## Files created

### Ponder package (`packages/ponder/`)

- **`package.json`** - Workspace package with Ponder, Hono, and Viem dependencies, following the `@se-2/ponder` naming convention.
- **`ponder.config.ts`** - Dynamically reads `deployedContracts` and `scaffold.config` from the nextjs package to auto-configure chains, ABIs, addresses, and start blocks. Falls back to `http://127.0.0.1:8545` for local development.
- **`ponder.schema.ts`** - Defines a `greetingChange` onchain table with columns matching the `GreetingChange` event args: `greetingSetter` (hex), `newGreeting` (text), `premium` (boolean), `value` (bigint), and `timestamp` (integer).
- **`src/YourContract.ts`** - Event handler that inserts a row into the `greetingChange` table each time a `GreetingChange` event is detected.
- **`src/api/index.ts`** - Hono-based API that serves a GraphQL endpoint at `/graphql`, auto-generating queries from the schema.
- **`ponder-env.d.ts`** - Type declarations for Ponder's virtual modules.
- **`tsconfig.json`** - Strict TypeScript config with `moduleResolution: "bundler"`.
- **`.gitignore`** - Ignores `node_modules`, `.ponder`, `/generated/`, and env files.
- **`.env.example`** - Reference environment variables for RPC URLs and database configuration.

### Modified files

- **`package.json` (root)** - Added `packages/ponder` to workspaces and added `ponder:dev`, `ponder:start`, `ponder:codegen`, `ponder:serve`, `ponder:lint`, `ponder:typecheck` scripts.
- **`packages/nextjs/package.json`** - Added `graphql` and `graphql-request` dependencies for querying the Ponder API.
- **`packages/nextjs/components/Header.tsx`** - Added "Events" navigation link with a magnifying glass icon.
- **`packages/nextjs/app/events/page.tsx`** - New page that queries the Ponder GraphQL API for `greetingChanges`, displaying them in a table with setter address, greeting text, premium badge, ETH value, and timestamp. Polls every 5 seconds for updates.

## How to use

1. Start the local chain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Install dependencies: `yarn install`
4. Start the Ponder indexer: `yarn ponder:dev`
5. Start the frontend: `yarn start`
6. Navigate to the "Events" page to see indexed `GreetingChange` events.
7. Use the Debug Contracts page to call `setGreeting` and watch events appear.
