import { createClient } from "wagmi";
import { appChains, wagmiConnectors } from "~~/services/web3/wagmiConnectors";

export const wagmiClient = createClient({
  autoConnect: false,
  connectors: wagmiConnectors,
  provider: appChains.provider,
});
