# Scaffold-ETH 2 and The Graph

Uses a subgraph from The Graph to index and query blockchain data.

## 🧑🏼‍🚀 The Graph

[The Graph](https://thegraph.com/) is a protocol for building decentralized applications (dApps) quickly on Ethereum and IPFS using GraphQL.

-   🗃️ **Decentralized Indexing**: The Graph enables open APIs ("subgraphs") to efficiently index and organize blockchain data.
-   🔎 **Efficient Querying**: The protocol uses GraphQL for streamlined querying blockchain data.
-   🙌 **Community Ecosystem**: The Graph fosters collaboration by empowering developers to build, deploy, and share subgraphs!

For detailed instructions and more context, check out the [Getting Started Guide](https://thegraph.com/docs/en/cookbook/quick-start).

&nbsp;

## ✅ Requirements

Before you begin, you need to install the following tools:

-   [Node.js](https://nodejs.org/en/download/)
-   Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
-   [Git](https://git-scm.com/downloads)
-   [Docker](https://docs.docker.com/get-docker/)

&nbsp;

## High level steps to create a subgraph

1. Create entities (schema.graphql)
2. Create mapping functions (mapping.ts)
3. Configure the subgraph data sources: name, network, source, entities, abis, eventHandlers (subgraph.yaml)
4. Run local graph node (yarn run-node)
5. Create a local subgraph (yarn local-create)
6. Build and deploy the subgraph to the local node (yarn local-ship)

More information at https://thegraph.com/docs/en/developing/creating-a-subgraph/

## Getting Started with subgraph-package of Scaffold-ETH 2

Clone the repository.

```
git clone -b subgraph-package \
  https://github.com/scaffold-eth/scaffold-eth-2.git \
  scaffold-eth-2-subgraph-package
```

Install all the packages required.

```
cd scaffold-eth-2-subgraph-package && \
  yarn install
```

Next, we will want to start up our local blockchain so that we can eventually deploy and test our smart contracts. Scaffold-ETH 2 comes with Hardhat by default. To spin up the chain just type the following yarn command…

```
yarn chain
```

> You will keep this window up and available so that you can see any output from hardhat console. 🖥️

Next we are going to spin up our frontend application. Scaffold-ETH 2 comes with NextJS by default and also can be started with a simple yarn command. You will need to open up a new command line and type the following…

```
yarn start
```

> You will also want to keep this window up at all times so that you can debug any code changes you make to NextJS, debug performance or just check that the server is running properly.

Next, you will want to open up a third window where you can deploy your smart contract, along with some other useful commands found in Scaffold-ETH. To do a deploy you can simply run the following…

```
yarn deploy
```

> You should get a tx along with an address and amount of gas spent on the deploy. ⛽

If you navigate to http://localhost:3000 you should see the NextJS application. Explore the menus and features of Scaffold-ETH 2! Someone call in an emergency, cause hot damn that is fire! 🔥

&nbsp;

## 🚀 Setup The Graph Integration

Now that we have spun up our blockchain, started our frontend application and deployed our smart contract, we can start setting up our subgraph and utilize The Graph!

> Before following these steps be sure Docker is running!

&nbsp;

#### ✅ Step 1: Clean up any old data and spin up our docker containers ✅

First run the following to clean up any old data. Do this if you need to reset everything.

```
yarn clean-node
```

> We can now spin up a graph node by running the following command… 🧑‍🚀

```
yarn run-node
```

This will spin up all the containers for The Graph using docker-compose. You will want to keep this window open at all times so that you can see log output from Docker.

> As stated before, be sure to keep this window open so that you can see any log output from Docker. 🔎

> NOTE FOR LINUX USERS: If you are running Linux you will need some additional changes to the project.

##### Linux Only

Update your package.json in packages/hardhat with the following command line option for the hardhat chain.

```
"chain": "hardhat node --network hardhat --no-deploy --hostname 0.0.0.0"
```

Save the file and then restart your chain in its original window.

```
yarn chain
```

You might also need to add a firewall exception for port 8432. As an example for Ubuntu... run the following command.

```
sudo ufw allow 8545/tcp
```

&nbsp;

#### ✅ Side Quest: Run a Matchstick Test ✅

Matchstick is a [unit testing framework](https://thegraph.com/docs/en/developing/unit-testing-framework/), developed by [LimeChain](https://limechain.tech/), that enables subgraph developers to test their mapping logic in a sandboxed environment and deploy their subgraphs with confidence!

The project comes with a pre-written test located in `packages/subgraph/tests/asserts.test.ts`

To test simply type....

```
yarn subgraph:test
```

> This will run `graph test` and automatically download the needed files for testing.

You should receive the following output.

```
Fetching latest version tag...
Downloading release from https://github.com/LimeChain/matchstick/releases/download/0.6.0/binary-macos-11-m1
binary-macos-11-m1 has been installed!

___  ___      _       _         _   _      _
|  \/  |     | |     | |       | | (_)    | |
| .  . | __ _| |_ ___| |__  ___| |_ _  ___| | __
| |\/| |/ _` | __/ __| '_ \/ __| __| |/ __| |/ /
| |  | | (_| | || (__| | | \__ \ |_| | (__|   <
\_|  |_/\__,_|\__\___|_| |_|___/\__|_|\___|_|\_\

Compiling...

💬 Compiling asserts...

Igniting tests 🔥

asserts
--------------------------------------------------
  Asserts:
    √ Greeting and Sender entities - 0.102ms

All 1 tests passed! 😎

[Thu, 07 Mar 2024 15:10:26 -0800] Program executed in: 1.838s.
```

#### ✅ Step 2: Create and ship our Subgraph ✅

Now we can open up a fourth window to finish setting up The Graph. 😅 In this forth window we will create our local subgraph!

> Note: You will only need to do this once.

```
yarn local-create
```

> You should see some output stating your Subgraph has been created along with a log output on your graph-node inside docker.

Next we will ship our subgraph! You will need to give your subgraph a version after executing this command. (e.g. 0.0.1).

```
yarn local-ship
```

> This command does the following all in one… 🚀🚀🚀

-   Copies the contracts ABI from the hardhat/deployments folder
-   Generates the networks.json file
-   Generates AssemblyScript types from the subgraph schema and the contract ABIs.
-   Compiles and checks the mapping functions.
-   … and deploy a local subgraph!

> If you get an error ts-node you can install it with the following command

```
npm install -g ts-node
```

You should get a build completed output along with the address of your Subgraph endpoint.

```
Build completed: QmYdGWsVSUYTd1dJnqn84kJkDggc2GD9RZWK5xLVEMB9iP

Deployed to http://localhost:8000/subgraphs/name/scaffold-eth/your-contract/graphql

Subgraph endpoints:
Queries (HTTP):     http://localhost:8000/subgraphs/name/scaffold-eth/your-contract
```

&nbsp;

#### ✅ Step 3: Test your Subgraph ✅

Go ahead and head over to your subgraph endpoint and take a look!

> Here is an example query…

```
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
```

> If all is well and you’ve sent a transaction to your smart contract then you will see a similar data output!

Next up we will dive into a bit more detail on how The Graph works so that as you start adding events to your smart contract you can start indexing and parsing the data you need for your front end application.

&nbsp;

## A list of all available commands

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
