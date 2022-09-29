import { Chain, Wallet, getWalletConnectConnector } from "@rainbow-me/rainbowkit";
import config from "next/config";
import { Connector } from "wagmi";
import { BurnerConnector } from "~~/web3/wagmi-connectors";
import { chain, configureChains } from "wagmi";

export interface BurnerWalletOptions {
  chains: Chain[];
}

const defaultChainId = chain.hardhat.id;

export const burnerWallet = ({ chains }: BurnerWalletOptions): Wallet => ({
  id: "burner-wallet",
  name: "Burner Wallet",
  iconUrl: "https://avatars.githubusercontent.com/u/56928858?s=200&v=4",
  iconBackground: "#0c2f78",
  //todo add conditions to hide burner wallet
  hidden: () => false,
  createConnector: () => {
    const connector = new BurnerConnector({ chains, options: { defaultChainId } });

    return {
      connector,
    };
  },
});
