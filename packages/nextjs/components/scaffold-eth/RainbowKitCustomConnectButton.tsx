import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { TAutoConnect, useAutoConnect, useNetworkColor } from "~~/hooks/scaffold-eth";
import Balance from "~~/components/scaffold-eth/Balance";
import { useSwitchNetwork } from "wagmi";
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
  const { switchNetwork } = useSwitchNetwork();

  const configuredChain = getTargetNetwork();
  const networkColor = useNetworkColor();

  const onSwitchNetwork = () => {
    switchNetwork?.(configuredChain.id);
  };

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

              if (chain.unsupported || chain.id !== configuredChain.id) {
                return (
                  <div className="rounded-md shadow-lg p-2">
                    <span className="text-error mr-2">Wrong network selected - ({chain.name})</span>
                    <span className="text-primary mr-2">Switch network to</span>
                    <button className="btn btn-xs btn-primary btn-outline" onClick={onSwitchNetwork}>
                      {configuredChain.name}
                    </button>
                  </div>
                );
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
