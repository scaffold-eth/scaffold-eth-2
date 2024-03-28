> ⚠️ The [CLI branch](https://github.com/scaffold-eth/scaffold-eth-2/tree/cli) is under active development.  
> If you find any bug, please report as [issue](https://github.com/scaffold-eth/scaffold-eth-2/issues) or send a message in [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)

# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install from NPM Registry and follow the CLI instructions.

```
npx create-eth@latest
```

> 💬 Hint: If you choose Foundry as solidity framework in the CLI, you'll also need Foundryup installed in your machine. Checkout: [getfoundry.sh](https://getfoundry.sh)

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat or Foundry, depending on which one you selected in the CLI. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in:

- `packages/hardhat/hardhat.config.ts` if you have Hardhat as solidity framework.
- `packages/foundry/foundry.toml` if you have Foundry as solidity framework.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract can be modified to suit your needs. Is located in:

- Hardhat => `packages/hardhat/contracts`
- Foundry => `packages/foundry/contracts`

The `yarn deploy` command uses a deploy script to deploy the contract to the network. You can customize it. Is located in:

- Hardhat => `packages/hardhat/deploy`
- Foundry => `packages/foundry/script`

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test` or `yarn foundry:test` depending of your solidity framework.

- Edit your smart contract:
  - Hardhat => `YourContract.sol` in `packages/hardhat/contracts`
  - Foundry => `YourContract.sol` in `packages/foundry/contracts`
- Edit your frontend in `packages/nextjs/pages`
- Edit your deployment scripts:
  - Hardhat => `packages/hardhat/deploy`
  - Foundry => `packages/foundry/script`

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
