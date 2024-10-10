> ⚠️ Under active development.
>
> If you find any bug, please report as [issue](https://github.com/scaffold-eth/create-eth/issues) or send a message in [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)

# 🏗 create-eth

CLI to create decentralized applications (dapps) using Scaffold-ETH 2.

This is an alternative method of installing Scaffold-ETH. Instead of directly [cloning SE-2](https://docs.scaffoldeth.io/quick-start/installation#option-1-setup-using-git-clone), you can use create-eth to create your own custom instance, where you can choose among several configurations and extensions.

<h4 align="center">
  <a href="https://github.com/scaffold-eth/scaffold-eth-2">SE-2 Repo</a> |
  <a href="https://docs.scaffoldeth.io">SE-2 Docs</a> |
  <a href="https://scaffoldeth.io">SE-2 Website</a>
</h4>

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.18)](https://nodejs.org/en/download/)
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

**What's next**:

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`
- Edit your smart contract test in: `packages/hardhat/test`. To run test use `yarn hardhat:test`
- You can add your Alchemy API Key in `scaffold.config.ts` if you want more reliability in your RPC requests.

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to create-eth

We welcome contributions to create-eth and Scaffold-ETH 2!

For more information and guidelines for contributing, please see:

- [create-eth CONTRIBUTING.MD](https://github.com/scaffold-eth/create-eth/blob/main/CONTRIBUTING.md) if you want to contribute to the CLI.
- [Scaffold-ETH 2 CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) if you want to contribute to SE-2 base code.
