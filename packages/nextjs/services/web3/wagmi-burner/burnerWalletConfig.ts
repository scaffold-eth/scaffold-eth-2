import { Chain, Wallet } from "@rainbow-me/rainbowkit";
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
  hidden: () => process.env.NEXT_PUBLIC_NETWORK !== "hardhat",
  // @ts-expect-error :  Some problem with wagmi inferring wrong `Address` type even after configuring it in global.d.ts
  // checkout - https://github.com/wagmi-dev/wagmi/issues/1712
  //  https://github.com/scaffold-eth/se-2/pull/96#issuecomment-1399269480
  createConnector: () => {
    const connector = new BurnerConnector({ chains, options: { defaultChainId: defaultBurnerChainId } });

    return {
      connector,
    };
  },
});
