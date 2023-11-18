import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  AddressInfoDropdown,
  AddressQRCodeModal,
  Balance,
  SelectNetwork,
  SwitchNetwork,
} from "~~/components/scaffold-eth";
import { useScaffoldConfig } from "~~/context/ScaffoldConfigContext";
import { useAutoConnect, useNetworkColor } from "~~/hooks/scaffold-eth";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  useAutoConnect();
  const networkColor = useNetworkColor();
  const { connector: activeAccount } = useAccount();
  const isBurnerWalletActive = activeAccount && activeAccount.id === "burner-wallet";
  const { configuredNetwork } = useScaffoldConfig();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(configuredNetwork, account.address)
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

              if (
                (isBurnerWalletActive && chain.unsupported) ||
                (isBurnerWalletActive && chain.id !== configuredNetwork.id)
              ) {
                return <SwitchNetwork />;
              }

              return (
                <div className="px-2 flex justify-end items-center">
                  {isBurnerWalletActive ? (
                    <div className="flex flex-col items-center mr-1">
                      <Balance address={account.address} className="min-h-0 h-auto" />
                      <span className="text-xs" style={{ color: networkColor }}>
                        {chain.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center mr-1">
                      <span className="text-xs" style={{ color: networkColor }}>
                        <Balance address={account.address} className="min-h-0 h-auto" />
                      </span>
                      <SelectNetwork chain={chain} />
                    </div>
                  )}
                  {!chain.unsupported && (
                    <>
                      <AddressInfoDropdown
                        address={account.address}
                        displayName={account.displayName}
                        ensAvatar={account.ensAvatar}
                        blockExplorerAddressLink={blockExplorerAddressLink}
                      />
                      <AddressQRCodeModal address={account.address} modalId="qrcode-modal" />
                    </>
                  )}
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
