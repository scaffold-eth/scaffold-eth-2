"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export const DatabaseProfileCard = async () => {
  const saveToDB = async () => {
    console.log("Saving to DB");
  };

  return (
    <>
      <p className="my-2 font-medium">Database Profile Card</p>
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const connected = mounted && account && chain;

          return (
            <>
              {(() => {
                if (!connected) {
                  return (
                    <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                      Initializing Wallet
                    </button>
                  );
                }

                return (
                  <>
                    <div className="flex flex-col items-center mr-1">
                      <span className="text-xs">{chain.name}</span>
                      <button className="btn btn-primary btn-sm" onClick={saveToDB} type="button">
                        Save to DB
                      </button>
                    </div>
                  </>
                );
              })()}
            </>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
};
