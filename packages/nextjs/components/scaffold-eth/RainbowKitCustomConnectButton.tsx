import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AddressInfoDropdown, AddressQRCodeModal, Balance, SelectNetwork } from "~~/components/scaffold-eth";
import { useAutoConnect, useNetworkColor } from "~~/hooks/scaffold-eth";
import { getBlockExplorerAddressLink, getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  useAutoConnect();
  const networkColor = useNetworkColor();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(getTargetNetwork(), account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              return (
                <div className="px-2 flex justify-end items-center">
                  <div className="flex items-center mr-1">
                    <span className="text-xs" style={{ color: networkColor }}>
                      <Balance address={account.address} className="min-h-0 h-auto" />
                    </span>
                    <SelectNetwork chain={chain} />
                  </div>
                  <AddressInfoDropdown
                    address={account.address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal address={account.address} modalId="qrcode-modal" />
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
