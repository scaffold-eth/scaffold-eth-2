import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { appChains, wagmiConnectors } from "~~/services/web3/wagmiConnectors";

export const wagmiConfig = createConfig({
  autoConnect: scaffoldConfig.walletAutoConnect,
  connectors: wagmiConnectors,
  publicClient: appChains.publicClient,
});
