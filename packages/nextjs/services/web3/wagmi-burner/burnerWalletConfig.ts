import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { hardhat } from "wagmi/chains";
import scaffoldConfig from "~~/scaffold.config";
import {
  BurnerConnector,
  burnerWalletId,
  burnerWalletName,
  defaultBurnerChainId,
} from "~~/services/web3/wagmi-burner/BurnerConnector";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const { onlyLocalBurnerWallet } = scaffoldConfig;
const targetNetwork = getTargetNetwork();
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
  hidden: () => {
    if (onlyLocalBurnerWallet) {
      return targetNetwork.id !== hardhat.id;
    }

    return false;
  },
  createConnector: () => {
    const connector = new BurnerConnector({ chains, options: { defaultChainId: defaultBurnerChainId } });

    return {
      connector,
    };
  },
});
