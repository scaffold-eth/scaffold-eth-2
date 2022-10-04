import { useState } from "react";
import { useBalance } from "wagmi";

type BalanceProps = {
  address: string;
  price: number;
  minimized?: boolean;
  wrapperClasses?: string;
};
/**----------------------
 * Display balance of an address
 * ---------------------*/

export default function Balance({ address, price, minimized, wrapperClasses }: BalanceProps) {
  const [isEthBalance, setIsEthBalance] = useState<boolean>(true);

  const {
    data: balanceData,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
  });

  let displayAddress = address?.slice(0, 5) + "..." + address?.slice(-4);

  const onToggleBalance = () => {
    setIsEthBalance(!isEthBalance);
  };

  //   on loading screen or no address supplied
  if (!address || isLoading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  //on fetch balance error
  if (isError) {
    return (
      <div
        className={` border-2 border-gray-400 rounded-xl p-2 flex flex-col items-center max-w-fit cursor-pointer  ${wrapperClasses}`}
      >
        {minimized === false && <div className="text-[10px] opacity-70">{displayAddress}</div>}
        <div className="text-warning text-xs">Error</div>
      </div>
    );
  }

  return (
    <div
      className={` border-2 border-gray-400 rounded-xl p-2 flex flex-col items-center max-w-fit cursor-pointer  ${wrapperClasses}`}
      onClick={onToggleBalance}
    >
      {minimized === false && <div className="text-[10px] opacity-70">{displayAddress}</div>}

      {/* display  eth or doller balance  */}
      <div className="w-full flex items-center  justify-center">
        {isEthBalance === true && (
          <>
            <span>{balanceData?.formatted}</span>
            <span className="text-xs font-bold m-1">ETH</span>
          </>
        )}

        {isEthBalance === false && (
          <>
            <span>{(Number(balanceData?.formatted) * price).toFixed(4)}</span>
            <span className="text-xs font-bold m-1">$</span>
          </>
        )}
      </div>
    </div>
  );
}
