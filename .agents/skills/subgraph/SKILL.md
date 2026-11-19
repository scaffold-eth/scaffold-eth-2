---
name: subgraph
description: "Integrate The Graph subgraph into a Scaffold-ETH 2 project for indexing blockchain events. Use when the user wants to: index contract events with The Graph, add a subgraph, query onchain data with GraphQL, set up a local graph node, or deploy a subgraph to Subgraph Studio."
---

# The Graph Subgraph Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[The Graph](https://thegraph.com/) is a decentralized indexing protocol for querying blockchain data via GraphQL. A **subgraph** defines which contract events to index, how to transform them, and exposes the indexed data through a GraphQL API. This skill adds a subgraph workspace to SE-2, with a local Graph Node (via Docker) for development and deployment to [Subgraph Studio](https://thegraph.com/studio/) for production.

For The Graph's full API reference, see the [official docs](https://thegraph.com/docs/). This skill focuses on the SE-2 integration — the workspace structure, the ABI copy bridge, and local development workflow. The examples index SE-2's default `YourContract`; adapt names, events and entities to the project's actual contracts.

## Dependencies & Scripts

### Subgraph workspace (`packages/subgraph/`)

If the root `package.json` lists its workspaces explicitly (as the SE-2 repo does), add the new one there. Projects created with `create-eth` use `"packages": ["packages/*"]`, which already picks it up:

```json
"workspaces": {
  "packages": ["packages/hardhat", "packages/nextjs", "packages/subgraph"]
}
```

(Keep whichever of `packages/hardhat` / `packages/foundry` the project uses.)

Create `packages/subgraph/package.json`. `your-contract` is the subgraph name — rename it to fit the project:

```json
{
  "name": "@se-2/subgraph",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "abi-copy": "tsx scripts/abi_copy.ts",
    "codegen": "graph codegen",
    "build": "graph build",
    "graph": "graph",
    "deploy": "graph deploy your-contract",
    "create-local": "graph create --node http://localhost:8020/ scaffold-eth/your-contract",
    "remove-local": "graph remove --node http://localhost:8020/ scaffold-eth/your-contract",
    "deploy-local": "graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 --version-label v0.0.1 scaffold-eth/your-contract",
    "local-ship": "yarn abi-copy && yarn codegen && yarn build --network localhost && yarn deploy-local",
    "test": "graph test -d",
    "run-node": "cd graph-node && docker compose up",
    "stop-node": "cd graph-node && docker compose down",
    "clean-node": "cd graph-node && docker compose down -v"
  }
}
```

`graph deploy` targets Subgraph Studio by default, so the `deploy` script needs no `--node`. `--version-label` keeps `deploy-local` from prompting for one.

Then install the dependencies (from the repo root):

```bash
yarn install
yarn workspace @se-2/subgraph add @graphprotocol/graph-cli @graphprotocol/graph-ts
yarn workspace @se-2/subgraph add -D matchstick-as tsx @types/node
```

Add the generated folders to `packages/subgraph/.gitignore`:

```gitignore
generated/
build/
abis/
networks.json
tests/.bin/
tests/.latest.json
```

### Root package.json scripts

```json
{
  "graph": "yarn workspace @se-2/subgraph graph",
  "subgraph:abi-copy": "yarn workspace @se-2/subgraph abi-copy",
  "subgraph:build": "yarn workspace @se-2/subgraph build",
  "subgraph:clean-node": "yarn workspace @se-2/subgraph clean-node",
  "subgraph:codegen": "yarn workspace @se-2/subgraph codegen",
  "subgraph:create-local": "yarn workspace @se-2/subgraph create-local",
  "subgraph:local-ship": "yarn workspace @se-2/subgraph local-ship",
  "subgraph:run-node": "yarn workspace @se-2/subgraph run-node",
  "subgraph:stop-node": "yarn workspace @se-2/subgraph stop-node",
  "subgraph:test": "yarn workspace @se-2/subgraph test"
}
```

## Docker Setup (Local Graph Node)

A local Graph Node needs three services: graph-node, IPFS and PostgreSQL. Pin the image versions (these were current when this skill was written; check [graph-node releases](https://github.com/graphprotocol/graph-node/releases) for newer ones):

```yaml
# packages/subgraph/graph-node/docker-compose.yml
services:
  graph-node:
    image: graphprotocol/graph-node:v0.45.0
    ports:
      - "8000:8000" # GraphQL HTTP
      - "8001:8001" # GraphQL WS
      - "8020:8020" # admin JSON-RPC (graph create / deploy)
      - "8030:8030" # indexing status
      - "8040:8040" # metrics
    depends_on:
      - ipfs
      - postgres
    extra_hosts:
      - host.docker.internal:host-gateway
    environment:
      postgres_host: postgres
      postgres_user: graph-node
      postgres_pass: let-me-in
      postgres_db: graph-node
      ipfs: "ipfs:5001"
      # <network name used in subgraph.yaml>:<RPC URL reachable from the container>
      ethereum: "localhost:http://host.docker.internal:8545"
      GRAPH_LOG: info
  ipfs:
    image: ipfs/kubo:v0.43.1
    ports:
      - "5001:5001"
    volumes:
      - ipfs-data:/data/ipfs
  postgres:
    image: postgres:17
    # No host port: graph-node reaches it over the compose network, so it doesn't
    # clash with another local Postgres on 5432 (e.g. the drizzle-neon skill's).
    command: ["postgres", "-cshared_preload_libraries=pg_stat_statements"]
    environment:
      POSTGRES_USER: graph-node
      POSTGRES_PASSWORD: let-me-in
      POSTGRES_DB: graph-node
      # graph-node requires the C locale and panics on startup otherwise
      POSTGRES_INITDB_ARGS: "--locale=C --encoding=UTF8"
    volumes:
      - pg-data:/var/lib/postgresql/data

volumes:
  ipfs-data:
  pg-data:
```

Named volumes keep the data out of the repo; `yarn subgraph:clean-node` (`docker compose down -v`) wipes it.

## Subgraph Configuration

### Subgraph manifest (`subgraph.yaml`)

The manifest defines what to index:

```yaml
# packages/subgraph/subgraph.yaml
specVersion: 1.3.0
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
      startBlock: 0
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
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

`specVersion`/`apiVersion` above match what `graph init` generates with graph-cli 0.98; newer CLIs may bump them.

**Key fields to update per project:**

- `name` — must match the contract name in `deployedContracts.ts` (the ABI file is `abis/localhost_<name>.json`)
- `address` — for `localhost`, `yarn build --network localhost` overwrites it from the `networks.json` written by `abi-copy`
- `startBlock` — on live networks, set it to the deployment block so indexing doesn't start from genesis
- `eventHandlers` — must match the exact Solidity event signatures (parameter names don't matter, types, `indexed` and order do)
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

Mappings transform raw event data into entities. They're written in [AssemblyScript](https://www.assemblyscript.org/) (a TypeScript subset that compiles to WASM). The `generated/` imports come from `yarn codegen`:

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

  const greeting = new Greeting(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
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

AssemblyScript is not TypeScript: no closures (so `Array.map/filter/reduce` with inline callbacks don't compile), no union types or `any`, no `console.log`. Use `log.info()` from `@graphprotocol/graph-ts` for logging.

## ABI Copy Bridge

The `abi-copy` script bridges SE-2's deployment output to the subgraph. It imports `packages/nextjs/contracts/deployedContracts.ts`, takes the ABIs and addresses for chain ID 31337 (localhost, or `CHAIN_ID` if set), and writes them to `packages/subgraph/abis/` and `networks.json`. `tsx` runs the TypeScript file directly, so there's no need to parse it by hand:

```typescript
// packages/subgraph/scripts/abi_copy.ts
import * as fs from "fs";
import deployedContracts from "../../nextjs/contracts/deployedContracts";

// Defaults to the local chain; override for live networks, e.g. CHAIN_ID=11155111 NETWORK_NAME=sepolia
const CHAIN_ID = Number(process.env.CHAIN_ID ?? 31337);
const NETWORK_NAME = process.env.NETWORK_NAME ?? "localhost"; // must match `network` in subgraph.yaml

const contracts = (deployedContracts as Record<number, Record<string, { address: string; abi: unknown }>>)[CHAIN_ID];
if (!contracts) {
  console.error(`No contracts for chain ${CHAIN_ID} in deployedContracts.ts. Run \`yarn deploy\` first.`);
  process.exit(1);
}

const networksPath = "./networks.json";
const networks = fs.existsSync(networksPath) ? JSON.parse(fs.readFileSync(networksPath, "utf8")) : {};
networks[NETWORK_NAME] = {};
fs.mkdirSync("./abis", { recursive: true });

for (const [name, { address, abi }] of Object.entries(contracts)) {
  networks[NETWORK_NAME][name] = { address };
  fs.writeFileSync(`./abis/${NETWORK_NAME}_${name}.json`, JSON.stringify(abi, null, 2));
}
fs.writeFileSync(networksPath, JSON.stringify(networks, null, 2));
console.log(`Copied ${Object.keys(contracts).length} contract(s) for ${NETWORK_NAME} to the subgraph package.`);
```

The import works because `deployedContracts.ts` only imports a type from `~~/...`, which tsx strips.

## Querying the Subgraph from the Frontend

A subgraph is a plain GraphQL endpoint: a `POST` with `{ query, variables }` is enough, so no extra dependencies are needed. Use TanStack Query (already in SE-2) for caching and refetching:

```tsx
// packages/nextjs/app/subgraph/page.tsx
"use client";

import { Address } from "@scaffold-ui/components";
import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";

// Local graph-node by default; set NEXT_PUBLIC_SUBGRAPH_URL to the Studio query URL in production
const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ?? "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const GREETINGS_QUERY = `
  query GetGreetings {
    greetings(first: 25, orderBy: createdAt, orderDirection: desc) {
      id
      greeting
      createdAt
      sender {
        address
        greetingCount
      }
    }
  }
`;

type Greeting = {
  id: string;
  greeting: string;
  createdAt: string; // BigInt fields come back as strings
  sender: { address: `0x${string}`; greetingCount: string };
};

async function fetchGreetings() {
  const res = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: GREETINGS_QUERY }),
  });
  const { data, errors } = await res.json();
  // GraphQL errors (bad query, subgraph not deployed yet) come back with status 200
  if (errors?.length) throw new Error(errors[0].message);
  return data.greetings as Greeting[];
}

const SubgraphPage: NextPage = () => {
  const {
    data: greetings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subgraph-greetings"],
    queryFn: fetchGreetings,
    refetchInterval: 5_000,
  });

  if (isLoading) return <span className="loading loading-spinner m-10" />;
  if (error) return <div className="alert alert-error m-10">{error.message}</div>;

  return (
    <table className="table m-10 w-auto">
      <thead>
        <tr>
          <th>Sender</th>
          <th>Greeting</th>
        </tr>
      </thead>
      <tbody>
        {greetings.map(g => (
          <tr key={g.id}>
            <td>
              <Address address={g.sender.address} />
            </td>
            <td>{g.greeting}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SubgraphPage;
```

BigInt and BigDecimal fields are serialized as strings — convert them with `BigInt(...)` before doing math or passing them to `formatEther`.

For typed queries generated from the schema, [Graph Client](https://github.com/graphprotocol/graph-client) or [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) also work. Note that `@graphprotocol/client-cli` currently pulls a git dependency (`uWebSockets.js`) that SE-2's Yarn setup blocks by default (`approvedGitRepositories`), so installing it needs that repo approved in `.yarnrc.yml` — ask the user before loosening that setting.

## Gotchas & Common Pitfalls

**Docker must be running.** The local Graph Node, IPFS, and Postgres all run in Docker.

**`yarn deploy` must run before `yarn subgraph:abi-copy`.** The ABI copy script reads `deployedContracts.ts`, which the deploy step generates.

**`create-local` only needs to run once.** It registers the subgraph name with the local Graph Node; running it again fails with "subgraph already exists". Re-run it after `clean-node`.

**Restarting the local chain invalidates the indexed data.** A fresh `yarn chain` starts from block 0, but graph-node still has the old chain's blocks and stops indexing. Run `yarn subgraph:clean-node`, start the node again, then `create-local` and `local-ship`.

**Linux: the chain must listen on `0.0.0.0`.** Docker reaches the host through `host.docker.internal` (the Docker bridge IP), and Hardhat/Anvil bind to `127.0.0.1` by default. Start the chain with `yarn chain --hostname 0.0.0.0` (Hardhat) or `ANVIL_IP_ADDR=0.0.0.0 yarn chain` (Foundry; `yarn chain` runs `make chain`, which doesn't forward arguments to `anvil`). A host firewall may also need to allow port 8545 from the Docker network. Docker Desktop (macOS/Windows) doesn't need this.

**Port conflicts.** The Graph Node stack publishes ports 8000, 8001, 8020, 8030, 8040 and 5001 (IPFS). The Postgres container doesn't publish a host port, so it doesn't clash with other local databases.

## How to Test

1. `yarn chain` (on Linux: `yarn chain --hostname 0.0.0.0` in Hardhat, `ANVIL_IP_ADDR=0.0.0.0 yarn chain` in Foundry) — start the local blockchain
2. `yarn deploy` — deploy contracts (generates `deployedContracts.ts`)
3. `yarn subgraph:run-node` — start the Docker Graph Node (keep this terminal open)
4. `yarn subgraph:create-local` — register the subgraph (once)
5. `yarn subgraph:local-ship` — copies ABIs, generates types, builds, and deploys
6. Send a transaction that emits the event (e.g. `setGreeting` from the Debug Contracts page)
7. Open `http://localhost:8000/subgraphs/name/scaffold-eth/your-contract/graphql` and run a query
8. `yarn start` and open `http://localhost:3000/subgraph` to see the indexed data
9. Optional: `yarn subgraph:test` runs [Matchstick](https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/) unit tests from `packages/subgraph/tests/` (`-d` runs them in Docker, which avoids binary compatibility issues)

### Deploying to Subgraph Studio

1. Update `subgraph.yaml`: change `network` from `localhost` to the target network (e.g. `sepolia`), and set the deployed `address` and `startBlock`
2. Copy the deployed contract's ABI (`abis/` is gitignored, so this is also needed on a fresh clone or in CI): `CHAIN_ID=11155111 NETWORK_NAME=sepolia yarn subgraph:abi-copy`, then point the manifest's `abis` entry to `./abis/sepolia_YourContract.json`
3. Create a subgraph on [Subgraph Studio](https://thegraph.com/studio/) and copy its deploy key
4. `yarn graph auth <DEPLOY_KEY>`
5. `yarn workspace @se-2/subgraph codegen && yarn workspace @se-2/subgraph build`
6. `yarn graph deploy <SUBGRAPH_SLUG>` (Studio is the default target)
7. Set `NEXT_PUBLIC_SUBGRAPH_URL` to the Studio query URL (shown on the subgraph's Studio page)

See The Graph docs for the [supported networks](https://thegraph.com/docs/en/supported-networks/).
