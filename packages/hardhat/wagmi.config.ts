import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "../nextjs/generated/contractHooks.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "./",
      commands: {
        clean: "yarn hardhat clean",
        build: "yarn hardhat compile",
        rebuild: "yarn hardhat compile",
      },
    }),
    react(),
  ],
});
