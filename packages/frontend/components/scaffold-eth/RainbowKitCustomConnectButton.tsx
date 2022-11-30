import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { TAutoConnect, useAutoConnect } from "~~/hooks/scaffold-eth";
import Balance from "~~/components/scaffold-eth/Balance";
import { useSwitchNetwork } from "wagmi";

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
  const { chains, switchNetwork } = useSwitchNetwork();

  const publicNetworkName = process.env.NEXT_PUBLIC_NETWORK;

  // ToDo. Use "chain" from wagmi (as in wagmiConnectors)
  // and get this by chain[publicNetworkName]
  // - With this we could also use mainnet (instead of homestead)
  const definedChain = chains.find(data => {
    return data.network === publicNetworkName?.toLowerCase();
  });

  const onSwitchNetwork = () => {
    if (definedChain && switchNetwork) {
      switchNetwork(definedChain?.id);
      return;
    }

    // if no NEXT_PUBLIC_NETWORK detected by default switch to mainnet chainid 1
    if (!definedChain && switchNetwork) {
      switchNetwork(1);
      return;
    }
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
            })}
            className="text-center"
          >
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-outline" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== definedChain?.id) {
                return (
                  <div className="rounded-xl shadow-lg p-2">
                    <span className="text-error mr-2">Wrong network selected! ({chain.name})</span>
                    <span className="text-primary mr-2">You and should be on</span>
                    <button className="btn btn-xs btn-primary btn-outline" onClick={onSwitchNetwork}>
                      {publicNetworkName}
                    </button>
                  </div>
                );
              }

              return (
                <div className="p-2 flex justify-end items-center">
                  <button
                    onClick={openChainModal}
                    className="btn btn-outline border-0 shadow-lg p-1 mt-2 mr-2 flex justify-center items-center"
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div className="mt-1">
                        {chain.iconUrl && (
                          <Image alt={chain.name ?? "Chain icon"} src={chain.iconUrl} width="25" height="25" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="m-1 font-bold text-md">{chain.name}</span>
                      <span>
                        <ChevronDownIcon className="h-6 w-4" />
                      </span>
                    </div>
                  </button>

                  <div className="flex justify-center items-center border-1 rounded-lg p-1 shadow-xl">
                    <div className="m-1">
                      <Balance address={account.address} />
                    </div>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="btn btn-outline border-0 p-2 flex justify-center items-center shadow-inner bg-gray-100"
                    >
                      <span className="m-1 font-bold text-md">{account.displayName}</span>

                      <span>
                        <ChevronDownIcon className="h-6 w-4" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
