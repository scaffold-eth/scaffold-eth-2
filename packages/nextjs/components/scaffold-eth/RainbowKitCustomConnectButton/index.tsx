"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { useAuthModal } from "@account-kit/react";
import { Address } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useClient } from "~~/hooks/scaffold-eth/useClient";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { openAuthModal } = useAuthModal();
  const { address } = useClient();
  const connected = !!address;

  if (!connected) {
    return (
      <button className="btn btn-primary btn-sm" onClick={openAuthModal} type="button">
        Connect Wallet
      </button>
    );
  }

  if (!address) {
    return <></>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(arbitrumSepolia, address);

  return (
    <>
      <div className="flex flex-col items-center mr-1">
        <Balance address={address as Address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          Arbitrum Sepolia
        </span>
      </div>
      <AddressInfoDropdown
        address={address as Address}
        displayName="Jade"
        blockExplorerAddressLink={blockExplorerAddressLink}
      />
      <AddressQRCodeModal address={address as Address} modalId="qrcode-modal" />
    </>
  );
};
