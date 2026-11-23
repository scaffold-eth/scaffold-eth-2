---
name: subgraph
description: "Integrate The Graph subgraph into a Scaffold-ETH 2 project for indexing blockchain events. Use when the user wants to: index contract events with The Graph, add a subgraph, query onchain data with GraphQL, set up a local graph node, or deploy a subgraph to Subgraph Studio."
---

# The Graph Subgraph Integration for Scaffold-ETH 2

## Prerequisites

Check if `./packages/nextjs/scaffold.config.ts` exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## Overview

[The Graph](https://thegraph.com/) is a decentralized indexing protocol for querying blockchain data via GraphQL. A **subgraph** defines which contract events to index, how to transform them, and exposes the indexed data through a GraphQL API. This skill adds a subgraph workspace to SE-2, with a local Graph Node (via Docker) for development and deployment to [Subgraph Studio](https://thegraph.com/studio/) for production.

For The Graph's full API reference, see the [official docs](https://thegraph.com/docs/). This skill focuses on the SE-2 integration — the workspace structure, the ABI copy bridge, and local development workflow.

## Dependencies & Scripts

### Subgraph package (`packages/subgraph/`)

Create `packages/subgraph/package.json`:

```json
{
  "name": "@se-2/subgraph",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "abi-copy": "tsx scripts/abi_copy.ts",
    "codegen": "graph codegen",
    "build": "graph build",
    "graph": "graph",
    "deploy": "graph deploy --node https://api.studio.thegraph.com/deploy/ your-contract",
    "create-local": "graph create --node http://localhost:8020/ scaffold-eth/your-contract",
    "remove-local": "graph remove --node http://localhost:8020/ scaffold-eth/your-contract",
    "deploy-local": "graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 scaffold-eth/your-contract",
    "local-ship": "yarn abi-copy && yarn codegen && yarn build --network localhost && yarn deploy-local",
    "test": "graph test -d",
    "run-node": "cd graph-node && docker compose up",
    "stop-node": "cd graph-node && docker compose down",
    "clean-node": "rm -rf graph-node/data/"
  },
  "dependencies": {
    "@graphprotocol/graph-cli": "^0.98.0",
    "@graphprotocol/graph-ts": "^0.38.0",
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  },
  "devDependencies": {
    "@types/chalk": "^2.2.0",
    "@types/node": "^20.11.0",
    "matchstick-as": "~0.6.0"
  }
}
```

### NextJS package additions

For querying the subgraph from the frontend via Graph Client:

```json
{
  "scripts": {
    "client": "graphclient build"
  },
  "dependencies": {
    "graphql": "^16.8.0"
  },
  "devDependencies": {
    "@graphprotocol/client-cli": "^3.0.0"
  }
}
```

### Root package.json scripts

```json
{
  "graph": "yarn workspace @se-2/subgraph graph",
  "graphclient:build": "yarn workspace @se-2/nextjs client",
  "subgraph:abi-copy": "yarn workspace @se-2/subgraph abi-copy",
  "subgraph:build": "yarn workspace @se-2/subgraph build",
  "subgraph:clean-node": "yarn workspace @se-2/subgraph clean-node",
  "subgraph:codegen": "yarn workspace @se-2/subgraph codegen",
  "subgraph:create-local": "yarn workspace @se-2/subgraph create-local",
  "subgraph:local-ship": "yarn workspace @se-2/subgraph local-ship",
  "subgraph:run-node": "yarn workspace @se-2/subgraph run-node",
  "subgraph:stop-node": "yarn workspace @se-2/subgraph stop-node",
  "subgraph:test": "yarn workspace @se-2/subgraph test -d"
}
```

## Docker Setup (Local Graph Node)

The Graph requires three services: a Graph Node, IPFS, and PostgreSQL. Create `packages/subgraph/graph-node/docker-compose.yml` with these three services:

- **graph-node**: `graphprotocol/graph-node:v0.41.1` — ports 8000 (GraphQL), 8001, 8020 (admin), 8030, 8040. Set `ethereum: "localhost:http://host.docker.internal:8545"` to connect to the local chain. Add `extra_hosts: ["host.docker.internal:host-gateway"]`.
- **ipfs**: `ipfs/kubo:v0.39.0` (not the legacy `ipfs/go-ipfs`) — port 5001, volume `./data/ipfs:/data/ipfs`
- **postgres**: `postgres` — port 5432, volume `./data/postgres:/var/lib/postgresql/data`. Credentials: user `graph-node`, password `let-me-in`, db `graph-node`. **Must set `POSTGRES_INITDB_ARGS: "--locale=C --encoding=UTF8"`** — graph-node requires the C locale and will panic on startup otherwise.

The graph-node environment also needs: `postgres_host: postgres`, `postgres_user/pass/db`, `ipfs: "ipfs:5001"`, `GRAPH_LOG: info`.

## Subgraph Configuration

### Subgraph manifest (`subgraph.yaml`)

The manifest defines what to index. Adapt this to the project's actual contracts:

```yaml
# packages/subgraph/subgraph.yaml
specVersion: 0.0.4
description: Your subgraph description
schema:
  file: ./src/schema.graphql
dataSources:
  - kind: ethereum/contract
    name: YourContract
    network: localhost
    source:
      abi: YourContract
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      entities:
        - Greeting
        - Sender
      abis:
        - name: YourContract
          file: ./abis/localhost_YourContract.json
      eventHandlers:
        - event: GreetingChange(indexed address,string,bool,uint256)
          handler: handleGreetingChange
      file: ./src/mapping.ts
```

**Key fields to update per project:**

- `name` — must match the contract name in `deployedContracts.ts`
- `address` — auto-updated by `abi-copy` script for localhost
- `eventHandlers` — must match the exact Solidity event signatures (parameter names don't matter, types and order do)
- `entities` — must match what's defined in `schema.graphql`

### GraphQL schema (`src/schema.graphql`)

Define entities that represent your indexed data. Each entity maps to a table in the Graph Node's Postgres:

```graphql
# packages/subgraph/src/schema.graphql
type Greeting @entity(immutable: true) {
  id: ID!
  sender: Sender!
  greeting: String!
  premium: Boolean
  value: BigInt
  createdAt: BigInt!
  transactionHash: String!
}

type Sender @entity(immutable: false) {
  id: ID!
  address: Bytes!
  greetings: [Greeting!] @derivedFrom(field: "sender")
  createdAt: BigInt!
  greetingCount: BigInt!
}
```

### AssemblyScript mappings (`src/mapping.ts`)

Mappings transform raw event data into entities. They're written in [AssemblyScript](https://www.assemblyscript.org/) (a TypeScript subset that compiles to WASM):

```typescript
// packages/subgraph/src/mapping.ts
import { BigInt } from "@graphprotocol/graph-ts";
import { GreetingChange } from "../generated/YourContract/YourContract";
import { Greeting, Sender } from "../generated/schema";

export function handleGreetingChange(event: GreetingChange): void {
  const senderString = event.params.greetingSetter.toHexString();
  let sender = Sender.load(senderString);

  if (sender === null) {
    sender = new Sender(senderString);
    sender.address = event.params.greetingSetter;
    sender.createdAt = event.block.timestamp;
    sender.greetingCount = BigInt.fromI32(1);
  } else {
    sender.greetingCount = sender.greetingCount.plus(BigInt.fromI32(1));
  }

  const greeting = new Greeting(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString(),
  );
  greeting.greeting = event.params.newGreeting;
  greeting.sender = senderString;
  greeting.premium = event.params.premium;
  greeting.value = event.params.value;
  greeting.createdAt = event.block.timestamp;
  greeting.transactionHash = event.transaction.hash.toHex();

  greeting.save();
  sender.save();
}
```

AssemblyScript compiles to WASM — no closures, no `Array.map/filter/reduce`, no `console.log`. Use `@graphprotocol/graph-ts` utilities for logging (`log.info()`).

## ABI Copy Bridge

The `abi-copy` script bridges SE-2's deployment output to the subgraph. It reads `packages/nextjs/contracts/deployedContracts.ts`, extracts ABIs and addresses for chain ID 31337 (localhost), and writes them to `packages/subgraph/abis/` and `networks.json`.

Create `packages/subgraph/scripts/abi_copy.ts` — this script parses the deployedContracts file, extracts contract data, and publishes it:

```typescript
// packages/subgraph/scripts/abi_copy.ts
import * as fs from "fs";
import type { Abi } from "viem";

const DEPLOYED_CONTRACTS_FILE = "../nextjs/contracts/deployedContracts.ts";
const GRAPH_DIR = "./";

function publishContract(
  contractName: string,
  contractObject: { address: string; abi: Abi },
  networkName: string,
) {
  const graphConfigPath = `${GRAPH_DIR}/networks.json`;
  let graphConfig = fs.existsSync(graphConfigPath)
    ? JSON.parse(fs.readFileSync(graphConfigPath, "utf8"))
    : {};

  if (!graphConfig[networkName]) graphConfig[networkName] = {};
  graphConfig[networkName][contractName] = { address: contractObject.address };

  fs.writeFileSync(graphConfigPath, JSON.stringify(graphConfig, null, 2));
  if (!fs.existsSync(`${GRAPH_DIR}/abis`)) fs.mkdirSync(`${GRAPH_DIR}/abis`);
  fs.writeFileSync(
    `${GRAPH_DIR}/abis/${networkName}_${contractName}.json`,
    JSON.stringify(contractObject.abi, null, 2),
  );
}

async function main() {
  const fileContent = fs.readFileSync(DEPLOYED_CONTRACTS_FILE, "utf8");
  const match = fileContent.match(
    /const deployedContracts = ({[^;]+}) as const;/s,
  );
  if (!match?.[1]) throw new Error("Failed to find deployedContracts");

  // Parse the TS object literal as JSON (add quotes around keys, remove trailing commas)
  let json = match[1]
    .replace(/(\w+)(?=\s*:)/g, '"$1"')
    .replace(/,(?=\s*[}\]])/g, "");
  const contracts = JSON.parse(json);
  const localContracts = contracts[31337];

  if (!localContracts) {
    console.error("No contracts for local network.");
    return;
  }

  for (const name in localContracts) {
    publishContract(name, localContracts[name], "localhost");
  }
  console.log("Published contracts to subgraph package.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## Graph Client (Frontend Queries)

[Graph Client](https://github.com/graphprotocol/graph-client) provides a typed GraphQL client with features like client-side composition and automatic pagination.

### Configuration

```yaml
# packages/nextjs/.graphclientrc.yml
sources:
  - name: YourContract
    handler:
      graphql:
        endpoint: http://localhost:8000/subgraphs/name/scaffold-eth/your-contract
documents:
  - ./graphql/GetGreetings.gql
```

### GraphQL queries

```graphql
# packages/nextjs/graphql/GetGreetings.gql
query GetGreetings {
  greetings(first: 25, orderBy: createdAt, orderDirection: desc) {
    id
    greeting
    premium
    value
    createdAt
    sender {
      address
      greetingCount
    }
  }
}
```

### Using in components

After running `yarn graphclient:build`, import the generated client. Use TanStack Query (already available in SE-2) for data fetching:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { GetGreetingsDocument, execute } from "~~/.graphclient";

async function fetchGreetings() {
  const result = await execute(GetGreetingsDocument, {});
  return result.data?.greetings ?? [];
}

const GreetingsTable = () => {
  const {
    data: greetings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subgraph-greetings"],
    queryFn: fetchGreetings,
  });

  // Render data...
};
```

> **`~~/.graphclient`** is the generated runtime artifact. It only exists after `yarn graphclient:build`. The `.graphclient/` directory should NOT be committed — it's generated from `.graphclientrc.yml` and the GQL files.

## Gotchas & Common Pitfalls

**Docker must be running.** The local Graph Node, IPFS, and Postgres all run in Docker. If Docker isn't running, `yarn subgraph:run-node` will fail.

**`yarn deploy` must run before `yarn subgraph:abi-copy`.** The ABI copy script reads from `deployedContracts.ts` which is generated by the deploy step. If you haven't deployed, there's nothing to copy.

**`local-ship` does everything in one command.** It runs `abi-copy` → `codegen` → `build` → `deploy-local` sequentially. Use this instead of running each step manually.

**`create-local` only needs to run once.** It registers the subgraph name with the local Graph Node. Running it again will error with "subgraph already exists." Only re-run after `clean-node`.

**Linux users need `--hostname 0.0.0.0`.** The default Hardhat/Anvil config binds to `127.0.0.1`, which Docker can't reach. Add `--hostname 0.0.0.0` (Hardhat) or `--host 0.0.0.0` (Anvil) to the chain command. You may also need `sudo ufw allow 8545/tcp`.

**Graph Client artifacts must be regenerated after schema changes.** Run `yarn graphclient:build` whenever you change the GraphQL schema or queries. The frontend imports from `~~/.graphclient` which contains generated types.

**Port conflicts with other services.** The Graph Node stack uses ports 5001 (IPFS), 5432 (Postgres), 8000 (GraphQL), 8020 (admin). If you're also running the drizzle-neon extension (which uses port 5432 for its own Postgres), you'll have a conflict. Change one of the Postgres ports.

## How to Test

1. `yarn chain` — start local blockchain
2. `yarn deploy` — deploy contracts (generates `deployedContracts.ts`)
3. `yarn subgraph:run-node` — start Docker Graph Node (keep this terminal open)
4. `yarn subgraph:create-local` — register subgraph (once only)
5. `yarn subgraph:local-ship` — copies ABIs, generates types, builds, and deploys
6. Visit `http://localhost:8000/subgraphs/name/scaffold-eth/your-contract/graphql` — test GraphQL queries
7. `yarn graphclient:build` — generate frontend client artifacts
8. `yarn start` — visit the subgraph page to see indexed data
9. `yarn subgraph:test` — run Matchstick unit tests

### Deploying to Subgraph Studio

1. Update `subgraph.yaml`: change `network` from `localhost` to target network (e.g., `sepolia`), add deployed `address` and `startBlock`
2. Create a subgraph on [Subgraph Studio](https://thegraph.com/studio/)
3. `yarn graph auth --studio <DEPLOY_KEY>`
4. `yarn graph deploy --studio <SUBGRAPH_SLUG>`
5. Update the Graph Client endpoint in `.graphclientrc.yml` to point to the Studio URL

For the full list of [supported networks](https://thegraph.com/docs/networks), check The Graph docs.
