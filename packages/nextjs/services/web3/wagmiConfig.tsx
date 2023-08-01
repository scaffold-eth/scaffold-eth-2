import { createConfig } from "wagmi";
import { appChains, wagmiConnectors } from "~~/services/web3/wagmiConnectors";

export const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: wagmiConnectors,
  publicClient: appChains.publicClient,
});
