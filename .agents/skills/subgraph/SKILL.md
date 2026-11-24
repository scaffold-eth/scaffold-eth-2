---
name: subgraph
description: "Use when the user wants to index contract events with a subgraph on The Graph's decentralized network (local Graph Node, Subgraph Studio). For a self-hosted indexer, use the ponder skill."
---

# The Graph Subgraph Integration for Scaffold-ETH 2

## Prerequisites

This skill assumes a Scaffold-ETH 2 project (`packages/nextjs/scaffold.config.ts` exists). If it isn't one, follow https://docs.scaffoldeth.io/SKILL.md to scaffold it first.

## Overview

[The Graph](https://thegraph.com/) is a decentralized indexing protocol: a **subgraph** declares which contract events to index and how to store them, and indexers on the network serve the data over GraphQL. This skill adds a `packages/subgraph/` workspace that reads SE-2's `deployedContracts.ts`, a local Graph Node (Docker) for development, and deployment to [Subgraph Studio](https://thegraph.com/studio/).

This skill covers the SE-2 glue; for the rest, see [The Graph docs](https://thegraph.com/docs/).

## Workspace Setup

If the root `package.json` lists its workspaces explicitly (as the SE-2 repo does), add `packages/subgraph` there. Projects created with `create-eth` use `"packages": ["packages/*"]`, which already picks it up.

Create `packages/subgraph/package.json`. `your-contract` is the subgraph name; rename it to fit the project:

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

`graph deploy` targets Subgraph Studio by default, so `deploy` needs no `--node`; `--version-label` keeps `deploy-local` from prompting. Leave out `"type": "module"`: with it, `tsx` runs `abi-copy` as ESM and its default import of `deployedContracts.ts` breaks.

Install from the repo root:

```bash
yarn install
yarn workspace @se-2/subgraph add @graphprotocol/graph-cli @graphprotocol/graph-ts
yarn workspace @se-2/subgraph add -D matchstick-as tsx @types/node
```

Gitignore the generated files in `packages/subgraph/.gitignore`: `generated/`, `build/`, `abis/`, `networks.json`, `tests/.bin/`, `tests/.latest.json`.

Add root scripts that forward to the workspace (`"subgraph:local-ship": "yarn workspace @se-2/subgraph local-ship"`, and likewise for `abi-copy`, `codegen`, `build`, `create-local`, `run-node`, `stop-node`, `clean-node` and `test`, plus `"graph": "yarn workspace @se-2/subgraph graph"`).

## Local Graph Node (Docker)

graph-node's own `docker/docker-compose.yml` is outdated (unpinned Postgres, old IPFS, Postgres on host port 5432), so use this one. Check [graph-node releases](https://github.com/graphprotocol/graph-node/releases) for newer image versions:

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
    # clash with another local Postgres on 5432
    command: ["postgres", "-cshared_preload_libraries=pg_stat_statements"]
    environment:
      POSTGRES_USER: graph-node
      POSTGRES_PASSWORD: let-me-in
      POSTGRES_DB: graph-node
      # graph-node requires the C locale and panics on startup otherwise
      POSTGRES_INITDB_ARGS: "--locale=C --encoding=UTF8"
    volumes:
      - pg-data:/var/lib/postgresql/data

volumes: # named volumes: `yarn subgraph:clean-node` wipes them without sudo
  ipfs-data:
  pg-data:
```

**Linux: the chain must listen on `0.0.0.0`.** The container reaches the host through `host.docker.internal` (the Docker bridge IP), and Hardhat/Anvil bind to `127.0.0.1` by default, so graph-node never receives blocks. Start the chain with `yarn chain --hostname 0.0.0.0` (Hardhat) or `ANVIL_IP_ADDR=0.0.0.0 yarn chain` (Foundry; `yarn chain` runs `make chain`, which doesn't forward arguments to `anvil`). A host firewall may also need to allow port 8545 from the Docker network. Docker Desktop (macOS/Windows) doesn't need this.

## ABI Copy Bridge

`abi-copy` writes the ABIs and addresses from SE-2's `deployedContracts.ts` to `abis/<network>_<Contract>.json` and `networks.json`, which `graph build --network` reads:

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

## Manifest, Schema and Mappings

The manifest ties SE-2's output to the subgraph through the data source `name`, the `network` and the ABI path:

```yaml
# packages/subgraph/subgraph.yaml
specVersion: 1.3.0 # what graph-cli 0.98's `graph init` generates; newer CLIs may bump it
schema:
  file: ./src/schema.graphql
dataSources:
  - kind: ethereum/contract
    name: YourContract # the contract name in deployedContracts.ts
    network: localhost # must match NETWORK_NAME in abi-copy and the network in docker-compose.yml
    source:
      abi: YourContract
      address: "0x0000000000000000000000000000000000000000" # `graph build --network localhost` fills it from networks.json
      startBlock: 0 # on live networks, the deployment block, or indexing starts from genesis
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
        - Greeting
      abis:
        - name: YourContract
          file: ./abis/localhost_YourContract.json # written by abi-copy
      eventHandlers:
        - event: GreetingChange(indexed address,string,bool,uint256)
          handler: handleGreetingChange
      file: ./src/mapping.ts
```

- **Schema** (`src/schema.graphql`): one `@entity` type per stored record ([schema docs](https://thegraph.com/docs/en/subgraphs/developing/creating/ql-schema/))
- **Mappings** (`src/mapping.ts`): one handler per `eventHandlers` entry, built on the types `yarn codegen` writes to `generated/`. They're [AssemblyScript](https://www.assemblyscript.org/), not TypeScript: no closures (so `Array.map/filter/reduce` with inline callbacks don't compile), no union types or `any`, and `log.info()` from `@graphprotocol/graph-ts` instead of `console.log`

## Frontend

Query the subgraph with `fetch` + TanStack Query, both already in SE-2, at `NEXT_PUBLIC_SUBGRAPH_URL` (default `http://localhost:8000/subgraphs/name/scaffold-eth/your-contract`; the Studio query URL in production). What differs from a plain GraphQL API:

- each entity gets a pluralized query (`Greeting` → `greetings`) with `first`, `skip`, `orderBy`, `orderDirection` and `where`
- `BigInt` and `BigDecimal` fields arrive as strings
- GraphQL errors (bad query, subgraph not deployed yet) arrive with status 200, so check `errors` before reading `data`

For typed queries, [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) works. [Graph Client](https://github.com/graphprotocol/graph-client) (`@graphprotocol/client-cli`) pulls a git dependency (`uWebSockets.js`) that SE-2's Yarn setup blocks (`approvedGitRepositories`); ask the user before loosening that setting.

## Local Workflow

1. `yarn chain` (on Linux, listening on `0.0.0.0`, see above) and `yarn deploy`
2. `yarn subgraph:run-node`, and keep it running
3. `yarn subgraph:create-local` registers the subgraph name with the node (needed again after `clean-node`)
4. `yarn subgraph:local-ship` copies the ABIs, generates types, builds and deploys. Re-run it after changing contracts, schema or mappings

**Restarting the local chain** leaves graph-node on the old chain's blocks, and indexing stops. Run `yarn subgraph:clean-node`, start the node again, then `create-local` and `local-ship`.

## Done When

Run each check and report what you saw:

1. `yarn subgraph:local-ship` ends with `Deployed to http://localhost:8000/subgraphs/name/...`
2. After a transaction that emits an indexed event (e.g. `setGreeting` from the Debug Contracts page), a query at `http://localhost:8000/subgraphs/name/scaffold-eth/your-contract` returns the new entity
3. With `yarn start`, the frontend page shows the indexed data
4. If the project has Matchstick tests in `packages/subgraph/tests/`, `yarn subgraph:test` passes (`-d` runs them in Docker)

## Deploying to Subgraph Studio

1. In `subgraph.yaml`, set `network` to the target network (e.g. `sepolia`), and the deployed `address` and `startBlock`
2. Copy the deployed ABI (also needed on a fresh clone or in CI, since `abis/` is gitignored): `CHAIN_ID=11155111 NETWORK_NAME=sepolia yarn subgraph:abi-copy`, then point the manifest's `abis` entry to `./abis/sepolia_YourContract.json`
3. Create a subgraph on [Subgraph Studio](https://thegraph.com/studio/) and copy its deploy key
4. `yarn graph auth <DEPLOY_KEY>`
5. `yarn workspace @se-2/subgraph codegen && yarn workspace @se-2/subgraph build`
6. `yarn graph deploy <SUBGRAPH_SLUG>`
7. Set `NEXT_PUBLIC_SUBGRAPH_URL` to the Studio query URL (shown on the subgraph's Studio page)

See The Graph docs for the [supported networks](https://thegraph.com/docs/en/supported-networks/).
