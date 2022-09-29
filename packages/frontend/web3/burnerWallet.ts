import { Chain, Wallet, getWalletConnectConnector } from "@rainbow-me/rainbowkit";

export interface BurnerWalletOptions {
  chains: Chain[];
}

import { chain, configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const data = jsonRpcProvider({
  rpc: () => ({
    http: `https://www.example.com`,
  }),
});

export const burnerWallet = (): Wallet => ({
  id: "burner-wallet",
  name: "Burner Wallet",
  iconUrl: "https://avatars.githubusercontent.com/u/56928858?s=200&v=4",
  iconBackground: "#0c2f78",
  //todo add conditions to hide burner wallet
  hidden: () => false,
  createConnector: () => {
    const connector = data(chains);

    return {
      connector,
      mobile: {
        getUri: async () => {
          const { uri } = (await connector.getProvider()).connector;
          return uri;
        },
      },
    };
  },
});
