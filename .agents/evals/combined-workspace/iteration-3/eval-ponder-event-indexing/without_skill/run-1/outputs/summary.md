# Ponder Event Indexing Implementation

## What was built

A Ponder indexer that listens for `GreetingChange` events emitted by the `YourContract` smart contract and exposes them via a GraphQL API. A corresponding frontend page in the Next.js app queries this API and displays the indexed events in a table.

## Architecture

1. **Ponder Indexer** (`packages/ponder/`) - A new workspace package that runs as a standalone service, indexing blockchain events and serving a GraphQL API on port 42069.
2. **Frontend Page** (`packages/nextjs/app/events/`) - A new "Events" page that fetches data from the Ponder GraphQL endpoint and displays GreetingChange events with auto-polling.

## Files Created

### Ponder Package (new workspace)

- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/package.json` - Package configuration with ponder, hono, and viem dependencies; scripts for dev/start/serve/codegen.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/tsconfig.json` - TypeScript configuration for the Ponder package.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/ponder.config.ts` - Ponder configuration defining the localhost chain (chainId 31337) and YourContract with its ABI and address.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/ponder.schema.ts` - Schema definition using `onchainTable` for the `greeting_change` table with fields for greetingSetter, newGreeting, premium, value, blockNumber, transactionHash, and timestamp. Includes indexes on greetingSetter and timestamp.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/src/index.ts` - Indexing function that handles `YourContract:GreetingChange` events, inserting each event into the `greeting_change` table.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/src/api/index.ts` - Hono-based API server exposing the GraphQL endpoint at `/graphql` and a health check at `/health`.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/abis/YourContractAbi.ts` - ABI definition for YourContract including the GreetingChange event and all contract functions.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/.env.example` - Example environment variables for RPC URL and contract address.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/ponder/.env.local` - Local development environment with default Hardhat values.

### Frontend (Next.js)

- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/nextjs/app/events/page.tsx` - Events page with metadata, rendering the EventsDisplay component.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/nextjs/app/events/_components/EventsDisplay.tsx` - Client component that queries the Ponder GraphQL API, displays GreetingChange events in a table with setter address, greeting text, premium badge, ETH value, and block number. Includes auto-polling every 5 seconds, loading states, error handling with retry, and empty state.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/nextjs/.env.development` - Development environment variable for the Ponder URL.

## Files Modified

- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/package.json` - Added `packages/ponder` to workspaces; added `ponder:dev`, `ponder:start`, `ponder:serve`, `ponder:codegen` scripts.
- `/Users/shivbhonde/Desktop/github/scaffold-eth-2/.claude/worktrees/agent-ab59b27b/packages/nextjs/components/Header.tsx` - Added "Events" navigation link with MagnifyingGlassIcon to the header menu.

## How to Use

1. Start the local blockchain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Update `packages/ponder/.env.local` with the deployed contract address if it differs from the default
4. Start the Ponder indexer: `yarn ponder:dev`
5. Start the Next.js frontend: `yarn start`
6. Navigate to `/events` to see indexed GreetingChange events
7. Use the Debug Contracts page to call `setGreeting` and watch events appear

## GraphQL Query Example

```graphql
query GreetingChanges {
  greetingChanges(orderBy: "timestamp", orderDirection: "desc", limit: 25) {
    items {
      id
      greetingSetter
      newGreeting
      premium
      value
      blockNumber
      transactionHash
      timestamp
    }
  }
}
```

The GraphiQL interface is available at `http://localhost:42069/graphql` (GET request) for interactive schema exploration.
