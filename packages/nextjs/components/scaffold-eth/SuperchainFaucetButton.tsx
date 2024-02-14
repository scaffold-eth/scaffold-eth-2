"use client";

import Image from "next/image";
import opLogo from "../assets/optimism_logo.png";
import { optimismSepolia } from "@wagmi/core/chains";
import { hardhat } from "viem/chains";
import { useNetwork, useSwitchNetwork } from "wagmi";

/**
 * FaucetButton button which lets you grab eth.
 */
export const SuperchainFaucetButton = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({
    onSuccess() {
      window.open("https://app.optimism.io/faucet", "_blank");
    },
  });

  const openSuperchainFaucet = () => {
    if (chain && chain.id !== hardhat.id) {
      window.open("https://app.optimism.io/faucet", "_blank");
    } else {
      switchNetwork?.(optimismSepolia.id);
    }
  };

  return (
    <div className={"ml-1"} data-tip="Grab funds from faucet">
      <button className="btn btn-secondary btn-sm px-2 rounded-full" onClick={() => openSuperchainFaucet()}>
        <Image alt="Optimism Logo" src={opLogo.src} width={20} height={20} />
        Superchain Faucet
      </button>
    </div>
  );
};
