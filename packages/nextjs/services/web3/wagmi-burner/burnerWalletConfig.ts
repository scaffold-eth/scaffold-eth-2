import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { hardhat } from "wagmi/chains";
import {
  BurnerConnector,
  burnerWalletId,
  burnerWalletName,
  defaultBurnerChainId,
} from "~~/services/web3/wagmi-burner/BurnerConnector";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

export interface BurnerWalletOptions {
  chains: Chain[];
}

const configuredNetwork = getTargetNetwork();
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
  hidden: () => configuredNetwork.id !== hardhat.id,
  createConnector: () => {
    const connector = new BurnerConnector({ chains, options: { defaultChainId: defaultBurnerChainId } });

    return {
      connector,
    };
  },
});
