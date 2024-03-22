export const quickStart = `## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

\`\`\`
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
\`\`\`

2. Run a local network in the first terminal:

\`\`\`
yarn chain
\`\`\`

This command starts a local Ethereum network using Foundry. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in \`packages/foundry/foundry.toml\`.

3. On a second terminal, deploy the test contract:

\`\`\`
yarn deploy
\`\`\`

This command deploys a test smart contract to the local network. The contract is located in \`packages/foundry/contracts\` and can be modified to suit your needs. The \`yarn deploy\` command uses the deploy script located in \`packages/foundry/script\` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

\`\`\`
yarn start
\`\`\`

Visit your app on: \`http://localhost:3000\`. You can interact with your smart contract using the \`Debug Contracts\` page. You can tweak the app config in \`packages/nextjs/scaffold.config.ts\`.

Run smart contract test with \`yarn foundry:test\`

- Edit your smart contract \`YourContract.sol\` in \`packages/foundry/contracts\`
- Edit your frontend homepage at \`packages/nextjs/app/page.tsx\`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in \`packages/foundry/script\``;

export const solidityFrameWork = "Foundry";
