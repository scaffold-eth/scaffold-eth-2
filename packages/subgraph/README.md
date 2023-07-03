# Add a subgraph to SE-2

Uses a subgraph from The Graph to index and query blockchain data.

More information at https://thegraph.com/docs/en/about/

## Creating a Subgraph

1. Create entities (schema.graphql)
2. Create mapping functions (mapping.ts)
3. Configure the subgraph data sources: name, network, source, entities, abis, eventHandlers (subgraph.yaml)
4. Run local graph node (yarn run-node)
5. Create a local subgraph (yarn local-create)
6. Build and deploy the subgraph to the local node (yarn local-ship)

More information at https://thegraph.com/docs/en/developing/creating-a-subgraph/

## Querying the Subgraph

### Install libraries

```
cd packages/nextjs
yarn add @apollo/client
yarn add graphql
```

### Add ApolloProvider

pages/_app.tsx

#### Import ApolloClient

```
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
```

#### Create ApolloClient

```
  const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";
  const apolloClient = new ApolloClient({
    uri: subgraphUri,
    cache: new InMemoryCache(),
  });
```

#### Add ApolloProvider element wrapping your app

```
<ApolloProvider client={apolloClient}>
```

### Query the subgraph


#### Import hooks

```
import { gql, useQuery } from "@apollo/client";
```

#### Query the subgraph

```
  const GREETINGS_GRAPHQL = `
  {
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
  `;

  const GREETINGS_GQL = gql(GREETINGS_GRAPHQL);
  const greetingsData = useQuery(GREETINGS_GQL, { pollInterval: 1000 });
```

## Commands

### run-node

```sh
yarn run-node
```

Spin up a local graph node (requires Docker).

### stop-node

```sh
yarn stop-node
```

Stop the local graph node.

### clean-node

```sh
yarn clean-node
```

Remove the data from the local graph node.

### local-create

```sh
yarn local-create
```

Create your local subgraph (only required once).

### local-remove

```sh
yarn local-remove
```

Delete a local subgprah.

### abi-copy

```sh
yarn abi-copy
```

Copy the contracts ABI from the hardhat/deployments folder. Generates the networks.json file too.

### codegen

```sh
yarn codegen
```

Generates AssemblyScript types from the subgraph schema and the contract ABIs.

### build

```sh
yarn build
```

Compile and check the mapping functions.

### local-deploy

```sh
yarn local-deploy
```

Deploy a local subgraph.

### local-ship

```sh
yarn local-ship
```

Run all the required commands to deploy a local subgraph (abi-copy, codegen, build and local-deploy).

### deploy

```sh
yarn deploy
```

Deploy a subgraph to TheGraph.
