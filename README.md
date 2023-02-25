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

2. Run a local network in the first terminal:

```
yarn chain
```

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

5. Once contract is deployed run the below command to generate hooks: 

```
yarn wagmi-generate
```

> Hint 1: Checkout `packages/nextjs/components/ExampleUi/ContractData.tsx` and `packages/nextjs/components/ExampleUi/ContractInteraction.tsx` for use of the generated hooks(Expected that you have ran `yarn wagmi-generate` already).Also checkout `Hint 3` & `Hint 4` for pattern they follow and internally works 

> Hint 2: `yarn wagmi-generate` command generates `wagmi.config.ts` inside `packages/hardhat` and then generate hooks inline with contract functions inside `packages/nextjs/generated/contractHooks.ts`

> Hint 3: Generated hooks are of the form `use{ContractName}{functionName}` example suppose we have `YourContract.sol` inside `packages/hardhat/contracts` dir, which contains `string public greetings` since its a public variable an getter function is set by solidity and the way to read this function from frontend will be by using `useYourContractGreeetings` hook. 

> Hint 4: The generated hooks are just wrappers over wagmi's [`useContractRead`](https://wagmi.sh/react/hooks/useContractRead) and [`useContractWrite`](https://wagmi.sh/react/hooks/useContractWrite) you can always inspect generated hooks inside `packages/nextjs/generated/contractHooks.ts` file after you run `yarn wagmi-generate`

4. On a third terminal, start your NextJS app:

```
yarn start
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

4. Verify your smart contract

You can verify your smart contract on Etherscan by running:

```
yarn verify --network network_name
```

## Deploying your NextJS App

Run `yarn vercel` and follow the steps to deploy to Vercel. Once you log in (email, github, etc), the default options should work. It'll give you a public URL.

If you want to redeploy to the same production URL you can run `yarn vercel --prod`. If you omit the `--prod` flag it will deploy it to a preview/test URL.

**Make sure your `.env.production` file has the values you need.**

**Hint**: We recommend connecting the project GitHub repo to Vercel so you the gets automatically deployed when pushing to `main`

---
## ⚠️ Disabling type & linting error checks 
> **Hint**
> Typescript helps you catch errors at compile time, which can save time and improve code quality, but can be challenging for those who are new to the language or who are used to the more dynamic nature of JavaScript. Below are the steps to disable type & lint check at different levels  
### Disabling commit checks
We run `pre-commit` [git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) which lints the staged files and don't let you commit if there is an linting error. 

To disable this, got to `.husky/pre-commit` file and comment out `yarn lint-staged --verbose`

```diff
- yarn lint-staged --verbose 
+ # yarn lint-staged --verbose
```

### Deploying to Vercel without any checks 
Vercel by default runs types and lint checks while developing `build` and deployment fails if there is an types or lint error. 

To ignore types and lint error checks while deploying, use : 
```shell
yarn vercel:yolo
```

### Disabling Github Workflow
We have github workflow setup checkout `.github/workflows/lint.yaml` which runs types and lint error checks every time code is __pushed__ to `main` branch or __pull request__ is made to `main` branch 

To disable it, **delete `.github` directory** 

---
## Contributing to Scaffold-Eth 2

We welcome contributions to Scaffold-Eth 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/se-2/blob/master/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-Eth 2.

