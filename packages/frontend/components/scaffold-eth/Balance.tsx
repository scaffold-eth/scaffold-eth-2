import { BigNumberish, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useBalance } from "wagmi";

type BalanceProps = {
  address: string;
  price: number;
  wrapperClasses?: string;
};

/**
Display balance of an address
*/

export default function Balance({ address, price, wrapperClasses }: BalanceProps) {
  const [isEthBalance, setIsEthBalance] = useState(true);
  const [balance, setBalance] = useState<any>();

  const {
    data: fetchBalanceData,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
  });

  const onToggleBalance = () => {
    setIsEthBalance(!isEthBalance);
  };

  useEffect(() => {
    setBalance(fetchBalanceData);
  }, [fetchBalanceData]);

  if (!address || isLoading || Boolean(balance) === false) {
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
      <div
        className={`border-2 border-gray-400 rounded-xl p-2 flex flex-col items-center max-w-fit cursor-pointer  ${wrapperClasses}`}
      >
        <div className="text-warning text-xs">Error</div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-gray-400 rounded-xl p-2 flex flex-col items-center max-w-fit cursor-pointer  ${wrapperClasses}`}
      onClick={onToggleBalance}
    >
      {/* display  eth or doller balance  */}
      <div className="w-full flex items-center  justify-center">
        {isEthBalance === true && (
          <>
            <span>{balance?.formatted}</span>
            <span className="text-xs font-bold m-1">ETH</span>
          </>
        )}

        {isEthBalance === false && (
          <>
            <span className="text-xs font-bold m-1">$</span>
            <span>
              {Number(ethers.utils.formatEther(balance?.value.mul(price).toString() as BigNumberish)).toFixed(2)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
