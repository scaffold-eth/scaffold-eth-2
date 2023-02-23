import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { TAutoConnect, useAutoConnect, useNetworkColor } from "~~/hooks/scaffold-eth";
import Balance from "~~/components/scaffold-eth/Balance";

import { BlockieAvatar } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

// todo: move this later scaffold config.  See TAutoConnect for comments on each prop
const tempAutoConnectConfig: TAutoConnect = {
  enableBurnerWallet: true,
  autoConnect: true,
};

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export default function RainbowKitCustomConnectButton() {
  useAutoConnect(tempAutoConnectConfig);

  const configuredChain = getTargetNetwork();
  const networkColor = useNetworkColor();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, openChainModal, mounted }) => {
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

              if (chain.unsupported || chain.id !== configuredChain.id) {
                if (chain.id === 1) {
                  return (
                    <div className="rounded-md shadow-lg p-2">
                      <button
                        className="text-white flex items-center gap-1 rounded-[10px] bg-red-500 px-4 py-2"
                        onClick={openChainModal}
                        type="button"
                      >
                        <span>Wrong network</span>
                        <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                      </button>
                    </div>
                  );
                }
                return <ConnectButton />;
              }

              return (
                <div className="px-2 flex justify-end items-center">
                  <div className="flex justify-center items-center border-1 rounded-lg">
                    <div className="flex flex-col items-center">
                      <Balance address={account.address} className="min-h-0 h-auto" />
                      <span className="text-xs" style={{ color: networkColor }}>
                        {chain.name}
                      </span>
                    </div>
                    <button onClick={openAccountModal} type="button" className="btn btn-primary btn-sm pl-2 shadow-md">
                      <BlockieAvatar address={account.address} size={24} ensImage={account.ensAvatar} />
                      <span className="m-1">{account.displayName}</span>
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
}
