import { FunctionFragment } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import { useContractRead, deepEqual } from "wagmi";
import { displayTxResult } from "./utilsDisplay";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

type TDisplayVariableProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
  refreshDisplayVariables: boolean;
};

const ANIMATION_TIME = 2000;

const DisplayVariable = ({ contractAddress, functionFragment, refreshDisplayVariables }: TDisplayVariableProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const configuredChain = getTargetNetwork();
  const {
    data: result,
    isFetching,
    refetch,
  } = useContractRead({
    chainId: configuredChain.id,
    address: contractAddress,
    abi: [functionFragment],
    functionName: functionFragment.name,
    args: [],
    onError: error => {
      notification.error(error.message);
    },
    structuralSharing: (prev, next) => {
      if (deepEqual(prev, next)) {
        return prev;
      }

      setShowAnimation(true);

      setTimeout(() => setShowAnimation(false), ANIMATION_TIME);
      return next;
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-lg mb-0 break-words">{functionFragment.name}</h3>
        <button className={`btn btn-ghost btn-xs ${isFetching ? "loading" : ""}`} onClick={async () => await refetch()}>
          {!isFetching && <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />}
        </button>
      </div>
      <div className="text-gray-500 font-medium flex flex-col items-start">
        <div>
          <span className="break-words block">{displayTxResult(result)}</span>
          <div
            className={`mt-0.25 h-1 bg-primary transition opacity-0 ${
              showAnimation ? "opacity-100 animate-pulse-fast" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default DisplayVariable;
