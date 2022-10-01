import { connectorsForWallets, wallet } from "@rainbow-me/rainbowkit";
import { configureChains, chain } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { burnerWalletConfig } from "~~/web3/wagmi-burner/burnerWalletConfig";
import { BurnerConnector } from "~~/web3/wagmi-burner";

export const appChains = configureChains(
  [
    chain.mainnet,
    chain.polygon,
    chain.optimism,
    chain.arbitrum,
    chain.hardhat,
    chain.localhost,
    chain.polygon,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [chain.goerli, chain.kovan, chain.rinkeby, chain.ropsten, chain.polygonMumbai]
      : []),
  ],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
    }),
    publicProvider(),
  ],
);

export const burnerChains = configureChains(
  [chain.localhost, chain.hardhat],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
    }),
    publicProvider(),
  ],
);

export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets: [
      wallet.metaMask({ chains: appChains.chains, shimDisconnect: true }),
      wallet.walletConnect({ chains: appChains.chains }),
      wallet.ledger({ chains: appChains.chains }),
      wallet.brave({ chains: appChains.chains }),
      wallet.coinbase({ appName: "scaffold-eth", chains: appChains.chains }),
      wallet.rainbow({ chains: appChains.chains }),
      burnerWalletConfig({ chains: burnerChains.chains }),
    ],
  },
]);
