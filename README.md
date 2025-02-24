# 🏗 create-eth

CLI to create decentralized applications (dapps) using Scaffold-ETH 2.

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">SE-2 Documentation</a> |
  <a href="https://scaffoldeth.io">SE-2 Website</a>
</h4>

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install the latest version of Scaffold-ETH 2

```
npx create-eth@latest
```

This command will install all the necessary packages and dependencies, so it might take a while.

> [!NOTE]
> You can also initialize your project with one of our extensions to add specific features or starter-kits. Learn more in our [extensions documentation](https://docs.scaffoldeth.io/extensions/).

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network that runs on your local machine and can be used for testing and development. Learn how to [customize your network configuration](https://docs.scaffoldeth.io/quick-start/environment#1-initialize-a-local-blockchain).

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. You can find more information about how to customize your contract and deployment script in our [documentation](https://docs.scaffoldeth.io/quick-start/environment#2-deploy-your-smart-contract).

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**What's next**:

Visit the [What's next section of our docs](https://docs.scaffoldeth.io/quick-start/environment#whats-next) to learn how to customize your contracts, frontend, and more.

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn all the technical details and guides of Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

Watch [BG Labs](https://youtube.com/playlist?list=PLJz1HruEnenD77QAsqnk7KG8rSOMk0B99&si=JXZRn78_NBcvJJoZ) - our video series on building with Scaffold-ETH 2.

## Contributing

Built by [BuidlGuidl](https://buidlguidl.com) builders, we welcome contributions to create-eth!

For more information and guidelines for contributing, please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/create-eth/blob/main/CONTRIBUTING.md)

## Community

<h4 align="center">
  <a href="https://x.com/buidlguidl">Buidlguidl X</a> |
  <a href="https://x.com/ScaffoldETH">SE-2 X</a> |
  <a href="https://t.me/joinchat/F7nCRK3kI93PoCOk">SE-2 developers chat</a>
</h4>
