# Ponder Event Indexing for YourContract

## What was built

A Ponder indexer that listens for `GreetingChange` events emitted by the `YourContract` smart contract and exposes them through a GraphQL API. A frontend page displays the indexed events in a table.

## Files created/modified

### New: `packages/ponder/` (Ponder indexer package)

- **`package.json`** -- Package definition with `@ponder/core`, `hono`, and `viem` dependencies. Scripts for `dev`, `start`, `codegen`, and `serve`.
- **`tsconfig.json`** -- TypeScript configuration targeting ES2022 with bundler module resolution.
- **`.env.local`** -- Environment variables for the local Hardhat RPC URL and the deployed contract address.
- **`ponder.config.ts`** -- Ponder configuration defining the `localhost` chain (chainId 31337) and the `YourContract` contract source with its ABI and address.
- **`ponder.schema.ts`** -- Database schema defining the `greeting_change` table with columns for greetingSetter, newGreeting, premium, value, blockNumber, timestamp, and transactionHash. Includes an index on greetingSetter.
- **`abis/YourContract.ts`** -- The full ABI for `YourContract` exported as a const assertion for type safety.
- **`src/index.ts`** -- Indexing handler that listens for `YourContract:GreetingChange` events and inserts records into the `greeting_change` table.
- **`src/api/index.ts`** -- Hono API server that exposes the Ponder GraphQL endpoint at `/` and `/graphql`.

### New: `packages/nextjs/app/events/page.tsx`

Frontend page that queries the Ponder GraphQL API for `GreetingChange` events and displays them in a table with columns for block number, setter address, greeting text, premium status, ETH value, and transaction hash. Auto-refreshes every 5 seconds.

### Modified: `packages/nextjs/components/Header.tsx`

Added an "Events" navigation link with a MagnifyingGlassIcon pointing to `/events`.

### Modified: `package.json` (root)

Added `packages/ponder` to workspaces and added `ponder:dev`, `ponder:start`, and `ponder:codegen` scripts.

## How to use

1. Start the local chain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Update `packages/ponder/.env.local` with the deployed contract address if different from the default
4. Start the Ponder indexer: `yarn ponder:dev`
5. Start the frontend: `yarn start`
6. Navigate to `/events` to see indexed GreetingChange events
7. Use the Debug Contracts page to call `setGreeting` and watch events appear in the Events page

## GraphQL query example

```graphql
query {
  greetingChanges(orderBy: "blockNumber", orderDirection: "desc", limit: 50) {
    items {
      id
      greetingSetter
      newGreeting
      premium
      value
      blockNumber
      timestamp
      transactionHash
    }
  }
}
```

The GraphQL API is served by Ponder at `http://localhost:42069/graphql` by default.
