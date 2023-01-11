import { useEffect, useState } from "react";
import { useBalance } from "wagmi";
import { useAppStore } from "~~/services/store/store";

type TBalanceProps = {
  address: string;
};

/**
 * Display (ETH & USD) balance of an ETH address.
 */
export default function Balance({ address }: TBalanceProps) {
  const [isEthBalance, setIsEthBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  const price = useAppStore(state => state.ethPriceSlice.ethPrice);

  const {
    data: fetchedBalanceData,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
  });

  const onToggleBalance = () => {
    setIsEthBalance(!isEthBalance);
  };

  useEffect(() => {
    if (fetchedBalanceData?.formatted) {
      setBalance(Number(fetchedBalanceData.formatted));
    }
  }, [fetchedBalanceData]);

  if (!address || isLoading || balance === null) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`border-2 border-gray-400 rounded-md p-2 flex flex-col items-center max-w-fit cursor-pointer`}>
        <div className="text-warning text-xs">Error</div>
      </div>
    );
  }

  return (
    <button
      className="btn btn-sm btn-ghost flex flex-col font-normal items-center hover:bg-transparent"
      onClick={onToggleBalance}
    >
      <div className="w-full flex items-center justify-center">
        {isEthBalance ? (
          <>
            <span>{balance?.toFixed(4)}</span>
            <span className="text-xs font-bold m-1">ETH</span>
          </>
        ) : (
          <>
            <span className="text-xs font-bold m-1">$</span>
            <span>{(balance * price).toFixed(2)}</span>
          </>
        )}
      </div>
    </button>
  );
}
