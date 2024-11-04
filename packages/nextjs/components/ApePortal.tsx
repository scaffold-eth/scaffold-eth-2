import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ApeConfig, ApePortal, ApeProvider, Bridge, Buy, Swap } from "@yuga-labs/ape-portal-public";

export const Portal = () => {
  const { openConnectModal = () => {} } = useConnectModal();
  const apeConfig: ApeConfig = { openConnectModal };

  return (
    <ApeProvider config={apeConfig}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
        <div className=" p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Buy</h3>
          <Buy />
        </div>
        <div className=" p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Bridge</h3>

          <Bridge />
        </div>
        <div className=" p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Swap</h3>

          <Swap />
        </div>
        <div className=" p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Portal</h3>

          <ApePortal />
        </div>
      </div>
    </ApeProvider>
  );
};
