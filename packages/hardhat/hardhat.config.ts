import * as dotenv from "dotenv";
dotenv.config();
import { type HardhatUserConfig, configVariable } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import type { TaskArguments } from "hardhat/types/tasks";
import hardhatIgnitionViemPlugin from "@nomicfoundation/hardhat-ignition-viem";
import { overrideTask } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis.js";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "cR4WnXePioePZ5fFrnSiR";

const config: HardhatUserConfig = {
  plugins: [hardhatIgnitionViemPlugin, hardhatToolboxViem],
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: {
      type: "http",
      chainType: "l1",
      url: "https://mainnet.rpc.buidlguidl.com",
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
  },
  tasks: [
    overrideTask(["ignition", "deploy"])
      .setAction(async () => ({
        default: async (
          taskArgs: TaskArguments,
          hre: HardhatRuntimeEnvironment,
          runSuper: (args: TaskArguments) => Promise<any>,
        ) => {
          // Run the original ignition deploy task
          await runSuper(taskArgs);

          // Generate TypeScript ABIs after successful deployment
          console.log("\n🔄 Generating TypeScript ABIs...");
          await generateTsAbis();
          console.log("✅ TypeScript ABIs generated successfully!\n");
        },
      }))
      .build(),
  ],
};

export default config;
