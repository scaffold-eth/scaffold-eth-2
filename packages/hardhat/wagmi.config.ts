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
          "5": "0x60fd3d8c0a7d6c4e4b54b8591333952c8cbc3ac1",
          "31337": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        },
        MyContract: { "31337": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" },
      },
    }),
    react(),
  ],
});
