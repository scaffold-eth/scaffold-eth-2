import { createConfig } from "ponder";
import { http } from "viem";

import { YourContractAbi } from "./abis/YourContractAbi";

// The contract address after deploying with `yarn deploy` on local hardhat network.
// Update this address after running `yarn deploy`.
const YOUR_CONTRACT_ADDRESS =
  (process.env.PONDER_YOUR_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default createConfig({
  chains: {
    localhost: {
      id: 31337,
      transport: http(process.env.PONDER_RPC_URL_1 ?? "http://127.0.0.1:8545"),
      disableCache: true,
    },
  },
  contracts: {
    YourContract: {
      abi: YourContractAbi,
      chain: "localhost",
      address: YOUR_CONTRACT_ADDRESS,
      startBlock: 0,
    },
  },
});
