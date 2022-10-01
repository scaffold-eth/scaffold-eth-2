import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { BurnerConnector, burnerWalletId, burnerWalletName, defaultBurnerChainId } from "~~/web3/wagmi-burner";

export interface BurnerWalletOptions {
  chains: Chain[];
}

export const burnerWalletConfig = ({ chains }: BurnerWalletOptions): Wallet => ({
  id: burnerWalletId,
  name: burnerWalletName,
  iconUrl: "https://avatars.githubusercontent.com/u/56928858?s=200&v=4",
  iconBackground: "#0c2f78",
  //todo add conditions to hide burner wallet
  hidden: () => false,
  createConnector: () => {
    const connector = new BurnerConnector({ chains, options: { defaultChainId: defaultBurnerChainId } });

    return {
      connector,
    };
  },
});
