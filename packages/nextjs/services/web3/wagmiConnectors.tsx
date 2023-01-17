import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  braveWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains } from "wagmi";
import chain from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";

/**
 * chains for the app
 */
export const appChains = configureChains(
  [
    chain.mainnet,
    chain.polygon,
    chain.optimism,
    chain.arbitrum,
    chain.hardhat,
    chain.localhost,
    chain.polygon,
    // todo replace with config instead of env
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [chain.goerli, chain.polygonMumbai] : []),
  ],
  [
    alchemyProvider({
      // ToDo. Move to .env || scaffold config
      // This is ours Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
      priority: 0,
    }),
    publicProvider({ priority: 1 }),
  ],
  {
    stallTimeout: 3_000,
    // Sets pollingInterval if using chain's other than local hardhat chain
    ...(process.env.NEXT_PUBLIC_NETWORK !== "hardhat"
      ? {
          pollingInterval: process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL
            ? parseInt(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL)
            : 30_000,
        }
      : {}),
  },
);

/**
 * list of burner wallet compatable chains
 */
export const burnerChains = configureChains(
  [chain.localhost, chain.hardhat],
  [
    alchemyProvider({
      // ToDo. Move to .env || scaffold config
      // This is ours Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
    }),
    publicProvider(),
  ],
);

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets: [
      metaMaskWallet({ chains: appChains.chains, shimDisconnect: true }),
      walletConnectWallet({ chains: appChains.chains }),
      ledgerWallet({ chains: appChains.chains }),
      braveWallet({ chains: appChains.chains }),
      coinbaseWallet({ appName: "scaffold-eth", chains: appChains.chains }),
      rainbowWallet({ chains: appChains.chains }),
      burnerWalletConfig({ chains: burnerChains.chains }),
    ],
  },
]);
