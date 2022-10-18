import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

// ToDo: add default api key
const defaultApiKey = process.env.ALCHEMY_API_KEY ?? '';
// ToDo: auto generate mnenoic for the deployer account
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY ?? '';

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first account as deployer
      default: 0,
    },
  },
  networks: {
    arbiturum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
    arbiturumTestnet: {
      url: `https://arb-rinkeby.g.alchemy.com/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
    optimisim: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
    optimisimKovan: {
      url: `https://opt-kovan.g.alchemy.com/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${defaultApiKey}`,
      accounts: [deployerPrivateKey]
    },
  },
  solidity: "0.8.17",
};

export default config;
