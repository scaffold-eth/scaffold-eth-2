# Ponder Event Indexing Implementation

## What was built

A complete Ponder blockchain indexer that listens for `GreetingChange` events emitted by the `YourContract` smart contract. The indexer stores each event's data (greeting setter address, new greeting text, premium status, ETH value, block number, timestamp, and transaction hash) in a database and exposes the data through a GraphQL API. A frontend page was also created to display the indexed events with address filtering and auto-polling.

## Architecture

1. **Ponder Indexer** (`packages/ponder/`) - A new workspace package that runs alongside the Hardhat chain and Next.js frontend. It connects to the local Hardhat node, watches for `GreetingChange` events, and stores them in a `greeting_change` table with indexed columns for efficient querying.

2. **GraphQL API** - Ponder automatically generates a GraphQL API at `http://localhost:42069/graphql` with full CRUD query support (filtering, ordering, pagination) based on the schema definition. A GraphiQL UI is available in the browser at the same URL.

3. **Frontend Events Page** (`/events`) - A Next.js page that queries the Ponder GraphQL API, displays greeting change events as cards, supports address filtering, and auto-polls every 4 seconds for new data.

## How to use

```bash
# Terminal 1: Start the local Hardhat chain
yarn chain

# Terminal 2: Deploy the contract
yarn deploy

# Terminal 3: Start the Ponder indexer
yarn ponder:dev

# Terminal 4: Start the Next.js frontend
yarn start
```

Then navigate to `http://localhost:3000/events` to see indexed events, or `http://localhost:42069/graphql` for the GraphiQL playground.

## Files created

| File | Description |
|------|-------------|
| `packages/ponder/package.json` | Ponder package with ponder, hono, and viem dependencies |
| `packages/ponder/tsconfig.json` | TypeScript configuration for the Ponder package |
| `packages/ponder/ponder.config.ts` | Ponder configuration defining the localhost network and YourContract contract |
| `packages/ponder/ponder.schema.ts` | Database schema with `greeting_change` table using `onchainTable` |
| `packages/ponder/src/index.ts` | Indexing function that handles `YourContract:GreetingChange` events |
| `packages/ponder/src/api/index.ts` | Hono app with GraphQL middleware for the API endpoint |
| `packages/ponder/abis/YourContract.ts` | ABI for YourContract including the GreetingChange event |
| `packages/ponder/.env.local` | Environment variables pointing to local Hardhat node |
| `packages/ponder/.env.example` | Example environment file for reference |
| `packages/ponder/.gitignore` | Git ignore for node_modules, generated files, and .ponder cache |
| `packages/nextjs/app/events/page.tsx` | Frontend page displaying indexed GreetingChange events |
| `packages/nextjs/hooks/useGreetingChanges.ts` | Custom hook to fetch events from Ponder GraphQL API with polling |

## Files modified

| File | Change |
|------|--------|
| `package.json` (root) | Added `packages/ponder` to workspaces array; added `ponder:dev`, `ponder:start`, `ponder:codegen` scripts |
| `packages/nextjs/components/Header.tsx` | Added "Events" navigation link with MagnifyingGlassIcon |
