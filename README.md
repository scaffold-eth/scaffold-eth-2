# Scaffold-Eth 2

*The best way to get started building decentralized applications on Ethereum!*

A new version of [scaffold-eth](https://github.com/scaffold-eth/scaffold-eth/tree/master) with its core functionality. Built using NextJS, RainbowKit, Wagmi and Typescript.

- ✅ Contract component to easily edit the smart contracts and view & test the contract on your frontend
- 🔥 Burner wallet & local faucet
- 🔐 Integration with the different wallet providers

---

## Quickstart

1. Clone this repo & install dependencies

```
git clone https://github.com/carletex/se-2.git
cd se-2
yarn install
```

2. Start your frontend on the first terminal

```
yarn start
```

3. On a second terminal, run a local network

```
yarn chain
```

4. On a third terminal, deploy the test contract

```
yarn deploy
```

Visit your app on: `http://localhost:3000`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend in `packages/frontend/pages`
- Edit your deployment scripts in `packages/hardhat/deploy`

## Deploying Smart Contracts

By default, `yarn deploy` will deploy the contract to the local network.

You can deploy your contracts to other networks. Check the `hardhat.config.js` for the networks that are pre-configured, you'll need to add your Alchemy API key & the private key of the deployer account. You can also add other network settings to the `hardhat.config.js` file. Here are the [Alchemy docs](https://docs.alchemy.com/docs/how-to-add-alchemy-rpc-endpoints-to-metamask) for information on specific networks.

1. Rename `.env.example` to `.env` and fill the required keys.

```
ALCHEMY_API_KEY="",
DEPLOYER_PRIVATE_KEY=""
```

2. Run the command below to deploy the contract to the target network. Make sure to have the funds in your deployer account to pay for the transaction.

```
yarn deploy --network network_name
```

## Contributing to Scaffold-Eth 2

We welcome contributions to Scaffold-Eth 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/se-2/blob/master/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-Eth 2.

