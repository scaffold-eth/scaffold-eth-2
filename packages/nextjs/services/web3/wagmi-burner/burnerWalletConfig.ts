import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { hardhat } from "wagmi/chains";
import scaffoldConfig from "@root/scaffold.config";
import {
  burnerWalletId,
  burnerWalletName,
  BurnerConnector,
  defaultBurnerChainId,
} from "~~/services/web3/wagmi-burner/BurnerConnector";
export interface BurnerWalletOptions {
  chains: Chain[];
}

/**
 * Wagmi config for burner wallet
 * @param param0
 * @returns
 */
export const burnerWalletConfig = ({ chains }: BurnerWalletOptions): Wallet => ({
  id: burnerWalletId,
  name: burnerWalletName,
  iconUrl: "https://avatars.githubusercontent.com/u/56928858?s=200&v=4",
  iconBackground: "#0c2f78",
  //todo add conditions to hide burner wallet
  hidden: () => scaffoldConfig.targetNetwork !== hardhat,
  createConnector: () => {
    const connector = new BurnerConnector({ chains, options: { defaultChainId: defaultBurnerChainId } });

    return {
      connector,
    };
  },
});
