import React, { useEffect, useState } from "react";
import { TAutoConnect, useAutoConnect } from "~~/hooks/scaffold-eth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Faucet } from "~~/components/scaffold-eth";
import { useBalance } from "wagmi";

// todo: move this later scaffold config.  See TAutoConnect for comments on each prop
const tempAutoConnectConfig: TAutoConnect = {
  enableBurnerWallet: true,
  autoConnect: true,
};

const HeaderBalance = ({ address, balanceSymbol }: { address: string; balanceSymbol: string }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const {
    data: fetchedBalanceData,
    // isError,
    // isLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
    cacheTime: 30_000,
  });

  useEffect(() => {
    if (fetchedBalanceData?.formatted) {
      setBalance(Number(fetchedBalanceData.formatted));
    }
  }, [fetchedBalanceData]);

  return (
    <span className="m-2">
      {balance?.toFixed(2)} {balanceSymbol}
    </span>
  );
};

/**
 * Site header
 */
export default function Header() {
  useAutoConnect(tempAutoConnectConfig);

  return (
    <div className="mt-5 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 items-center justify-center">
      {/* <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        showBalance={true}
        chainStatus={{
          smallScreen: "icon",
          largeScreen: "icon",
        }}
      /> */}

      {/* custom connect button */}
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
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
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={openChainModal} style={{ display: "flex", alignItems: "center" }} type="button">
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button onClick={openAccountModal} type="button">
                      {account.displayName}
                      <HeaderBalance address={account.address} balanceSymbol={account.balanceSymbol as string} />
                    </button>
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
