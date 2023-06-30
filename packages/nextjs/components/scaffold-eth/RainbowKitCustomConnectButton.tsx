import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { ArrowLeftOnRectangleIcon, ArrowsRightLeftIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Balance, BlockieAvatar } from "~~/components/scaffold-eth";
import { useAutoConnect, useNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  useAutoConnect();

  const networkColor = useNetworkColor();
  const configuredNetwork = getTargetNetwork();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

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

              if (chain.unsupported || chain.id !== configuredNetwork.id) {
                return (
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="dropdown-toggle btn btn-error btn-sm">
                      <span>Wrong network</span>
                      <ChevronDownIcon className="ml-2 h-6 w-4 sm:ml-0" />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu rounded-box mt-1 bg-base-100 p-2 shadow-lg">
                      <li>
                        <button
                          className="menu-item"
                          type="button"
                          onClick={() => switchNetwork?.(configuredNetwork.id)}
                        >
                          <ArrowsRightLeftIcon className="ml-2 h-6 w-4 sm:ml-0" />
                          <span className="whitespace-nowrap">
                            Switch to <span style={{ color: networkColor }}>{configuredNetwork.name}</span>
                          </span>
                        </button>
                      </li>
                      <li>
                        <button className="menu-item text-error" type="button" onClick={() => disconnect()}>
                          <ArrowLeftOnRectangleIcon className="ml-2 h-6 w-4 sm:ml-0" /> <span>Disconnect</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                );
              }

              return (
                <div className="flex items-center justify-end px-2">
                  <div className="border-1 flex items-center justify-center rounded-lg">
                    <div className="mr-1 flex flex-col items-center">
                      <Balance address={account.address} className="h-auto min-h-0" />
                      <span className="text-xs" style={{ color: networkColor }}>
                        {chain.name}
                      </span>
                    </div>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md"
                    >
                      <BlockieAvatar address={account.address} size={24} ensImage={account.ensAvatar} />
                      <span className="ml-2 mr-1">{account.displayName}</span>
                      <span>
                        <ChevronDownIcon className="h-6 w-4" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
