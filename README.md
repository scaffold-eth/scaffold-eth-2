# Scaffold-Eth 2

⚠️ This project is currently under active development. Things might break. Feel free to check the open issues & create new ones.

*The best way to get started building decentralized applications on Ethereum!*

A new version of [scaffold-eth](https://github.com/scaffold-eth/scaffold-eth/tree/master) with its core functionality. Built using NextJS, RainbowKit, Wagmi and Typescript.

- ✅ Contract component to easily edit the smart contracts and view & test the contract on your frontend
- 🔥 Burner wallet & local faucet
- 🔐 Integration with the different wallet providers

---

## Quickstart

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/se-2.git
cd se-2
yarn install
```

2. Start your NextJS app on the first terminal

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
- Edit your frontend in `packages/nextjs/pages`
- Edit your deployment scripts in `packages/hardhat/deploy`

## Deploying Smart Contracts
Once you are ready to deploy your smart contracts, there are a few things you need to adjust.

1. Select the network

By default, ```yarn deploy``` will deploy the contract to the local network. You can change the defaultNetwork in `packages/hardhat/hardhat.config.js.` You could also simply run ```yarn deploy --network target_network``` to deploy to another network.

Check the `hardhat.config.js` for the networks that are pre-configured. You can also add other network settings to the `hardhat.config.js file`. Here are the [Alchemy docs](https://docs.alchemy.com/docs/how-to-add-alchemy-rpc-endpoints-to-metamask) for information on specific networks.

2. Generate a new account or add one to deploy the contract(s) from. Additionally you will need to add your Alchemy API key. Rename `.env.example` to `.env` and fill the required keys.

```
ALCHEMY_API_KEY="",
DEPLOYER_PRIVATE_KEY=""
```

The deployer account is the account that will deploy your contracts and execute calls you make in your deployment script.

You can generate a random account / private key with ```yarn generate``` or add the private key of your crypto wallet. ```yarn generate``` will create a random account and add the DEPLOYER_PRIVATE_KEY to the .env file. You can check the generated account with ```yarn account```.

3. Deploy your smart contract(s)

Run the command below to deploy the smart contract to the target network. Make sure to have some funds in your deployer account to pay for the transaction.

```
yarn deploy --network network_name
```

## Contributing to Scaffold-Eth 2

We welcome contributions to Scaffold-Eth 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/se-2/blob/master/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-Eth 2.

