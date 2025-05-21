# 🏗 Scaffold-DOT


🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on Polkadot Hub blockchain with Solidity smart contracts. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, Reown AppKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-DOT, follow the steps below:

1. Install the latest version of Scaffold-DOT

```
git clone https://github.com/scaffold-dot/scaffold-dot.git
```

```
yarn i
```

These commands will install all the necessary packages and dependencies, so it might take a while.

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Polkadot network that runs on your local machine and can be used for testing and development.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**What's next**:

Scaffold-DOT is a fork of scaffold-ETH2. For now, you can follow their docs below.

Visit the [What's next section of our docs](https://docs.scaffoldeth.io/quick-start/environment#whats-next) to learn how to:

- Edit your smart contracts
- Edit your deployment scripts
- Customize your frontend
- Edit the app config
- Writing and running tests
- [Setting up external services and API keys](https://docs.scaffoldeth.io/deploying/deploy-smart-contracts#configuration-of-third-party-services-for-production-grade-apps)

## Documentation

Visit the Scaffold-ETH 2 [docs](https://docs.scaffoldeth.io) to learn all the technical details and guides for working with Scaffold-DOT.

To know more about its features, check out their [website](https://scaffoldeth.io).

## Contributing to Scaffold-DOT

We welcome contributions to Scaffold-DOT!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-dot/scaffold-dot/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
