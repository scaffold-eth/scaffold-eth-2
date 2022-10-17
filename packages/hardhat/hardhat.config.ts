import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first account as deployer
      default: 0,
    },
  },
  solidity: "0.8.15",
};

export default config;
