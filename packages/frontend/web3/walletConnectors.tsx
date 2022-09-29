import { connectorsForWallets, wallet } from "@rainbow-me/rainbowkit";
import { wagmiChains } from "~~/web3/chains";

export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets: [
      wallet.metaMask({ chains: wagmiChains.chains }),
      wallet.walletConnect({ chains: wagmiChains.chains }),
      wallet.ledger({ chains: wagmiChains.chains }),
      wallet.brave({ chains: wagmiChains.chains }),
      wallet.coinbase({ appName: "scaffold-eth", chains: wagmiChains.chains }),
      wallet.rainbow({ chains: wagmiChains.chains }),
    ],
  },
]);
