import { formatEther } from "viem";
import { useAccountBalance } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type TokenAmountProps = {
  amount: number;
  decimals?: number;
  isEth?: boolean;
};

/**
 * Display a token amount with a custom amount of decimals.
 * If it's ETH, allow for showing its USD value with a button push.
 */
export const TokenAmount = ({ amount, decimals = 4, isEth = false }: TokenAmountProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { price, isError, isLoading, onToggleBalance, isEthBalance } = useAccountBalance();

  return (
    <>
      {isEth ? (
        <>
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-md bg-slate-300 h-6 w-6"></div>
              <div className="flex items-center space-y-6">
                <div className="h-2 w-28 bg-slate-300 rounded"></div>
              </div>
            </div>
          ) : isError ? (
            <div className="border-2 border-gray-400 rounded-md px-2 flex flex-col items-center max-w-fit cursor-pointer">
              <div className="text-warning">Error</div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                className={`btn btn-sm btn-ghost flex flex-col font-normal items-center hover:bg-transparent`}
                onClick={onToggleBalance}
              >
                <div className="w-full flex items-center justify-center">
                  {isEthBalance ? (
                    <>
                      <span>{parseFloat(formatEther(BigInt(amount))).toFixed(decimals)}</span>
                      <span className="text-[0.8em] font-bold ml-1">{targetNetwork.nativeCurrency.symbol}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[0.8em] font-bold mr-1">$</span>
                      <span>{parseFloat(formatEther(BigInt(amount * price))).toFixed(2)}</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full flex items-center justify-center">
          <strong>{parseFloat(formatEther(BigInt(amount))).toFixed(decimals)}</strong>
        </div>
      )}
    </>
  );
};
