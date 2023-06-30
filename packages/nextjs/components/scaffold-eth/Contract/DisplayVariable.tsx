import { useEffect } from "react";
import { FunctionFragment } from "ethers/lib/utils";
import { useContractRead } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { displayTxResult } from "~~/components/scaffold-eth";
import { useAnimationConfig } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

type TDisplayVariableProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
  refreshDisplayVariables: boolean;
};

export const DisplayVariable = ({
  contractAddress,
  functionFragment,
  refreshDisplayVariables,
}: TDisplayVariableProps) => {
  const {
    data: result,
    isFetching,
    refetch,
  } = useContractRead({
    chainId: getTargetNetwork().id,
    address: contractAddress,
    abi: [functionFragment],
    functionName: functionFragment.name,
    args: [],
    onError: error => {
      notification.error(error.message);
    },
  });

  const { showAnimation } = useAnimationConfig(result);

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center gap-2">
        <h3 className="mb-0 break-all text-lg font-medium">{functionFragment.name}</h3>
        <button className={`btn btn-ghost btn-xs ${isFetching ? "loading" : ""}`} onClick={async () => await refetch()}>
          {!isFetching && <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />}
        </button>
      </div>
      <div className="flex flex-col items-start font-medium text-gray-500">
        <div>
          <div
            className={`block break-all bg-transparent transition ${
              showAnimation ? "animate-pulse-fast rounded-sm bg-warning" : ""
            }`}
          >
            {displayTxResult(result)}
          </div>
        </div>
      </div>
    </div>
  );
};
