# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

> [!NOTE]
> 🤖 Scaffold-ETH 2 is AI-ready! It has everything agents need to build on Ethereum. Check `.agents/`, `.claude/`, `.opencode` or `.cursor/` for more info.

⚙️ Built using NextJS, RainbowKit, Foundry/Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v22.10.0)](https://nodejs.org/en/download/)
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

### ERC-7730 Clear Signing metadata (experimental)

After deploying a contract, the Hardhat flavor can scaffold and validate an [ERC-7730](https://eips.ethereum.org/EIPS/eip-7730) calldata descriptor from the saved Rocketh deployment:

This integration targets the active ERC-7730 2.0.0 registry schema. The draft `3.0.0-next` schema is intentionally out of scope until it becomes stable.

```bash
yarn clear-signing init \
  --network sepolia \
  --contract YourContract \
  --entity my-project \
  --url https://example.com
```

The generated `packages/hardhat/clear-signing/<network>/<contract>.config.json` deliberately starts with every function excluded and unreviewed. Select the functions users sign, author their intent and display fields, and add representative test arguments. Then run `check`, inspect its human-readable preview, and mark each selected function as reviewed before `prepare`:

```bash
yarn clear-signing check --network sepolia --contract YourContract
yarn clear-signing prepare --network sepolia --contract YourContract
```

`check` uses pinned versions of the official Python `erc7730` linter, registry schemas, chain metadata, the Sourcify Clear Signing formatter, and Sourcify's verified ABI. It requires a full Sourcify match, an explicitly non-proxy deployment, and exact equality between the normalized deployment and Sourcify function ABIs. Install [uv](https://docs.astral.sh/uv/) to run the pinned Python tools without managing an environment. If the contract is not verified yet, the existing verification flow can be invoked automatically:

```bash
yarn clear-signing check --network sepolia --contract YourContract --verify-sourcify
```

Formatter and descriptor warnings fail the workflow instead of being hidden in a clean preview. In particular, an `addressName`, token, NFT, chain, or constrained address type must be resolvable from the fixture data provider; otherwise use an honest raw format or supply representative fixture metadata. The v2 linter's explorer-ABI fetch is replaced by the exact Sourcify comparison; if that fetch still emits its known infrastructure warning, the exception is shown and recorded in provenance. Test descriptions must be unique.

`prepare` creates a registry-shaped directory containing the v2 descriptor and its `testsv2` fixture. Publication remains manual. Relative schema links resolve after the entity folder is copied into the registry. This first version covers calldata descriptors for direct, non-proxy deployments; proxy constraints and EIP-712 descriptors remain manual. The accompanying provenance report establishes deployment, exact function-ABI equality, verification, pinned lint/schema validation, and rendering self-consistency. Fixture expectations are generated from the descriptor being tested, so they are not an independent semantic oracle. None of this claims the descriptor was independently audited or that the contract is safe.

**What's next**:

Visit the [What's next section of our docs](https://docs.scaffoldeth.io/quick-start/environment#whats-next) to learn how to:

- Edit your smart contracts
- Edit your deployment scripts
- Customize your frontend
- Edit the app config
- Writing and running tests
- [Setting up external services and API keys](https://docs.scaffoldeth.io/deploying/deploy-smart-contracts#configuration-of-third-party-services-for-production-grade-apps)

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn all the technical details and guides of Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
