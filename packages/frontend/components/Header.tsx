import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Faucet } from "~~/components/scaffold-eth";
import { TAutoConnect, useAutoConnect } from "~~/hooks/scaffold-eth";

import Balance from "./scaffold-eth/Balance";

// todo: move this later scaffold config.  See TAutoConnect for comments on each prop
const tempAutoConnectConfig: TAutoConnect = {
  enableBurnerWallet: true,
  autoConnect: true,
};

/**
 * Site header
 */
export default function Header() {
  useAutoConnect(tempAutoConnectConfig);

  return (
    <div className="mt-5 flex justify-center items-center">
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
              })}
              className="w-1/3"
            >
              {(() => {
                if (!connected) {
                  return (
                    <button onClick={openConnectModal} type="button">
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button">
                      Wrong network
                    </button>
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
      <Faucet />
    </div>
  );
}
