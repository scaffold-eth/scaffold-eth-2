import { createConfig } from "ponder";
import { http } from "viem";
import { YourContractAbi } from "./abis/YourContractAbi";

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
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      startBlock: 0,
    },
  },
});
