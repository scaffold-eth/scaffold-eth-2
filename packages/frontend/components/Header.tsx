import React from "react";
import { TAutoConnect, useAutoConnect } from "~~/hooks/scaffold-eth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Faucet } from "~~/components/scaffold-eth";

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
    <div className="mt-5 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 items-center justify-center">
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        showBalance={true}
        chainStatus={{
          smallScreen: "icon",
          largeScreen: "icon",
        }}
      />
      <Faucet />
    </div>
  );
}
