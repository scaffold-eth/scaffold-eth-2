// This adds support for typescript paths mappings
import "tsconfig-paths/register";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import { kebabToCamelCase } from "./utils";
import scaffoldConfig from "@root/scaffold.config";

const defaultNetwork =
  scaffoldConfig.targetNetwork.network === "hardhat"
    ? "localhost"
    : kebabToCamelCase(scaffoldConfig.targetNetwork.network);

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork,
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${scaffoldConfig.providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    arbitrumGoerli: {
      url: `https://arb-goerli.g.alchemy.com/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    optimismGoerli: {
      url: `https://opt-goerli.g.alchemy.com/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${scaffoldConfig.providerApiKey}`,
      accounts: [scaffoldConfig.deployerPrivateKey],
    },
  },
  verify: {
    etherscan: {
      apiKey: `${scaffoldConfig.etherscanApiKey}`,
    },
  },
};

export default config;
