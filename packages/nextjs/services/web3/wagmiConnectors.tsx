import { burnerWalletConfig } from "./wagmi-burner/burnerWalletConfig";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

// import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";

// const { targetNetworks, onlyLocalBurnerWallet } = scaffoldConfig;
const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: chains.Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, chains.mainnet] as const);

const wallets = [metaMaskWallet, walletConnectWallet, ledgerWallet, coinbaseWallet, rainbowWallet, burnerWalletConfig];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],

  {
    appName: "scaffold-eth-2",
    projectId: scaffoldConfig.walletConnectProjectId,
  },
);
