require('@nomicfoundation/hardhat-toolbox');
require('@parity/hardhat-polkadot');
require('hardhat-deploy');

import { task } from 'hardhat/config';
import generateTsAbis from './scripts/generateTsAbis';

// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
// Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "5d81f7f73383460d1fd532ca3da3769fd9e69ee047cd4239aa667b4a2c8c5d94";

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

  defaultNetwork: "westendHub",
  
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
  },
};