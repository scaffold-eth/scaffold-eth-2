# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Foundry, Wagmi, Viem, and Typescript.

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
- [Foundryup](https://book.getfoundry.sh/getting-started/installation)

> **Note for Windows users**. Foundryup is not currently supported by Powershell or Cmd. You will need to use [Git BASH](https://gitforwindows.org/) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) as your terminal.

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install && forge install --root packages/foundry
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Anvil for testing and development. You can customize the network in `packages/foundry/foundry.toml`. When deploying to this local chain, Scaffold-ETH 2 creates a keystore account using Anvil's last address private key. This keystore account is named `scaffold-eth-local` with the password `localhost`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network with the keystore account mentioned in `packages/foundry/.env#ETH_KEYSTORE_ACCOUNT`. When using `scaffold-eth-locahost` this command doesn't require any password. The contract is located in `packages/foundry/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/foundry/script/Deploy.s.sol` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

## Deploying to live networks

1. Configure you network

Scaffold-ETH 2 comes with a selection of predefined networks. You can also add your custom network in `packages/foundry/foundry.toml`

2. Generate a new keystore account or import your existing account

The keystore account mentioned in `packages/foundry/.env#ETH_KEYSTORE_ACCOUNT` is the account used to deploy your contracts. Additionally, the deployer account will be used to exectue function call that are part of your deployment script. You can generate a new keystore account with random address which will be used for all your next Scaffold-ETH 2 projects using the following command:

```shell
yarn generate
```

Above command will prompt for password and generate a new keystore account under the name `scaffold-eth-custom`. Now update the `packages/foundry/.env#ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom`. Subsequent `yarn deploy` will prompt the password for this account and use this as a deployer account.

Additionally instead of generating `scaffold-eth-custom` keystore account with random address you can run `yarn account:import` to initialize `scaffold-eth-custom` keystore account with your private key.

Also if you want to use your existing keystore account you can update the `packages/foundry/.env#ETH_KEYSTORE_ACCOUNT` with the name of your existing account and that account will be used for deployments.

You can check the configured (generated or manually set) account and balances with:

```
yarn account
```

3. Deploy your smart contract(s)

Run the command below to deploy the smart contract to the target network. Make sure to have some funds in your deployer account to pay for the transaction.

```
yarn deploy --network <network-name>
```

eg: `yarn deploy --network sepolia`

4. Verify your smart contract
   You can verify your smart contract on etherscan by running:

```
yarn verify --network <network-name>
```

eg: `yarn verify --network sepolia`

This uses `VerifyAll.s.sol` script located in `packages/foundry/script` to verify the contract.

**What's next**:

- Edit your smart contract `YourContract.sol` in `packages/foundry/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/script/deploy/Deploy.s.sol`
- Edit your smart contract test in: `packages/foundry/test`. To run test use `yarn foundry:test`

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
