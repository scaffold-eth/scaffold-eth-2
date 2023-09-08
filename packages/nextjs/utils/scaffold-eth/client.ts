import { createTestClient, publicActions, walletActions, webSocket } from "viem";
import { hardhat } from "wagmi/chains";

const transport = webSocket("ws://127.0.0.1:8545");

export const extendedClient = createTestClient({
  chain: hardhat,
  mode: "hardhat",
  transport,
})
  .extend(publicActions)
  .extend(walletActions);
