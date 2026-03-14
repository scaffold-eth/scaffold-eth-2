import { createConfig } from "ponder";
import { http } from "viem";
import { YourContractAbi } from "./abis/YourContract";

export default createConfig({
  chains: {
    localhost: {
      id: 31337,
      rpc: http(process.env.PONDER_RPC_URL_1 ?? "http://127.0.0.1:8545"),
    },
  },
  contracts: {
    YourContract: {
      abi: YourContractAbi,
      chain: "localhost",
      // Replace with the deployed contract address after running `yarn deploy`
      address: process.env.YOUR_CONTRACT_ADDRESS as `0x${string}`,
      startBlock: 0,
    },
  },
});
