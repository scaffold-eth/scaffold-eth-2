import { createConfig } from "ponder";
import { http } from "viem";
import { YourContractAbi } from "./abis/YourContract";

// The deployed contract address on the local Hardhat network.
// Update this after running `yarn deploy` if the address changes.
const YOUR_CONTRACT_ADDRESS =
  (process.env.YOUR_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default createConfig({
  networks: {
    localhost: {
      chainId: 31337,
      transport: http(process.env.PONDER_RPC_URL_1 ?? "http://127.0.0.1:8545"),
    },
  },
  contracts: {
    YourContract: {
      abi: YourContractAbi,
      network: "localhost",
      address: YOUR_CONTRACT_ADDRESS,
      startBlock: 0,
    },
  },
});
