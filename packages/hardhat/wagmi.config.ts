import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "../nextjs/generated/contractHooks.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "./",
      deployments: {
        YourContract: {
          31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          5: "0x60fd3d8c0a7d6c4e4b54b8591333952c8cbc3ac1",
        },
      },
    }),
    react(),
  ],
});
