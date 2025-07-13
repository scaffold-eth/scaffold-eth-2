require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');
require('@parity/hardhat-polkadot');
require('hardhat-deploy');

import "hardhat-deploy-ethers";
import { task } from 'hardhat/config';
import generateTsAbis from './scripts/generateTsAbis';

// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
// Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
const deployerPrivateKey = process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses our block explorers default API keys.
const etherscanApiKey = process.env.ETHERSCAN_MAINNET_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
const etherscanOptimisticApiKey = process.env.ETHERSCAN_OPTIMISTIC_API_KEY || "RM62RDISS1RH448ZY379NX625ASG1N633R";
const basescanApiKey = process.env.BASESCAN_API_KEY || "ZZZEIPMT1MNJ8526VV2Y744CA7TNZR64G6";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

// Extend the deploy task
task("deploy").setAction(async (args, hre, runSuper) => {
  // Run the original deploy task
  await runSuper(args);
  // Force run the generateTsAbis script with deployed contracts
  const deployedContracts = (global as any).deployedContracts;
  await generateTsAbis(hre, deployedContracts);
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  // npm Compiler
  resolc: {
    version: '1.5.2',
    compilerSource: 'npm',
    settings: {
      optimizer: {
        enabled: true,
        parameters: 'z',
        fallbackOz: true,
        runs: 200,
      },
    },
  },
  
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },

  defaultNetwork: "passetHub",
  
  networks: {
    hardhat: {
      polkavm: true,
      forking: {
        url: 'wss://westend-asset-hub-rpc.polkadot.io',
      },
      // nodeConfig: {
      //   nodeBinaryPath: 'INSERT_PATH_TO_SUBSTRATE_NODE',
      //   rpcPort: 8000,
      //   dev: true,
      // },
      adapterConfig: {
        adapterBinaryPath: 'INSERT_PATH_TO_ETH_RPC_ADAPTER',
        dev: true,
      },
    },
    localNode: {
      polkavm: true,
      url: `http://127.0.0.1:8545`,
    },
    westendHub: {
      polkavm: true,
      url: 'https://westend-asset-hub-eth-rpc.polkadot.io',
      accounts: [deployerPrivateKey],
    },
    passetHub: {
      polkavm: true,
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      accounts: [deployerPrivateKey],
    },
  },
};
