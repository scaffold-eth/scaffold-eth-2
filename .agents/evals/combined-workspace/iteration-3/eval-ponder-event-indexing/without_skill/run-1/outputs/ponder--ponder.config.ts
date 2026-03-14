import { createConfig } from "ponder";
import { YourContractAbi } from "./abis/YourContractAbi";

export default createConfig({
  chains: {
    localhost: {
      id: 31337,
      rpc: process.env.PONDER_RPC_URL_31337 ?? "http://127.0.0.1:8545",
    },
  },
  contracts: {
    YourContract: {
      abi: YourContractAbi,
      chain: "localhost",
      address: process.env.PONDER_YOUR_CONTRACT_ADDRESS as `0x${string}`,
      startBlock: 0,
    },
  },
});
