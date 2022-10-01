import { createClient } from "wagmi";
import { appChains, wagmiConnectors } from "~~/web3/wagmiConnectors";

export const wagmiClient = createClient({
  autoConnect: false,
  connectors: wagmiConnectors,
  provider: appChains.provider,
  webSocketProvider: appChains.webSocketProvider,
});
