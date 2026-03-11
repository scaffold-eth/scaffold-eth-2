# Ponder Event Indexing for YourContract

## What was built

A Ponder indexer package (`packages/ponder`) that listens for `GreetingChange` events emitted by the `YourContract` smart contract and exposes them via an auto-generated GraphQL API. A frontend events page (`/events`) queries this API and displays the indexed events in a table.

## Files created

### Ponder package (`packages/ponder/`)

- **package.json** -- Ponder package with `ponder` and `viem` dependencies; scripts for `dev`, `start`, `serve`, `codegen`.
- **ponder.config.ts** -- Configures Ponder with a `localhost` chain (chain ID 31337 for Hardhat) and the `YourContract` contract with its ABI, address, and start block.
- **ponder.schema.ts** -- Defines a `greeting_change` table using `onchainTable` with columns for `greetingSetter`, `newGreeting`, `premium`, `value`, `blockNumber`, `timestamp`, and `transactionHash`. Includes an index on `greetingSetter`.
- **src/index.ts** -- Indexing function that listens for `YourContract:GreetingChange` events and inserts records into the `greeting_change` table.
- **abis/YourContractAbi.ts** -- Full ABI for the YourContract contract (extracted from the Solidity source).
- **tsconfig.json** -- TypeScript configuration for the Ponder package.
- **.env.local** -- Default RPC URL pointing to the local Hardhat node.
- **.gitignore** -- Ignores `.ponder/`, `node_modules/`, and `generated/` directories.

### Frontend (`packages/nextjs/`)

- **app/events/page.tsx** -- New events page that queries the Ponder GraphQL API (`http://localhost:42069/graphql`) for `GreetingChange` events, displays them in a table with setter address, greeting text, premium status, ETH value, and block number. Polls every 5 seconds for new events.

### Modified files

- **packages/nextjs/components/Header.tsx** -- Added "Events" navigation link to the header menu.
- **package.json** (root) -- Added `packages/ponder` to workspaces and `ponder:dev`, `ponder:start`, `ponder:serve`, `ponder:codegen` scripts.

## How to run

1. Start the local chain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Start the Ponder indexer: `yarn ponder:dev`
4. Start the frontend: `yarn start`
5. Visit `http://localhost:3000/events` to see indexed events
6. Use the Debug Contracts page to call `setGreeting` and watch events appear on the Events page
