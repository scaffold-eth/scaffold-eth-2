import type { HardhatUserConfig } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import type { TaskArguments } from "hardhat/types/tasks";
import hardhatIgnitionViemPlugin from "@nomicfoundation/hardhat-ignition-viem";
import { overrideTask } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis.js";

const config: HardhatUserConfig = {
  plugins: [hardhatIgnitionViemPlugin],
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
