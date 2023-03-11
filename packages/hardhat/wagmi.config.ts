import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";
import { getParsedDeploymentsForWagmiConfig } from "./utils";

export default defineConfig({
  out: "../nextjs/generated/contractHooks.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "./",
      deployments: getParsedDeploymentsForWagmiConfig(),
    }),
    react(),
  ],
});
