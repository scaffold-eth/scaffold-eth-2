import { useEffect } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useContractRead } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { displayTxResult } from "~~/components/scaffold-eth";
import { useAnimationConfig } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type DisplayVariableProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  refreshDisplayVariables: boolean;
  inheritedFrom?: string;
  abi: Abi;
};

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi,
  inheritedFrom,
}: DisplayVariableProps) => {
  const {
    data: result,
    isFetching,
    refetch,
  } = useContractRead({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    onError: error => {
      notification.error(error.message);
    },
  });

  const { showAnimation } = useAnimationConfig(result);

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  return (

<div className="grid grid-cols-3 lg:grid-cols-1">
    <div className="data-label col-span-1 p-4 py-6 lg:pb-0 flex items-center">
    
    <div className="mb-0 break-all data-label text-sm">{abiFunction.name}</div>
        <button className="btn btn-ghost btn-xs" onClick={async () => await refetch()}>
          {isFetching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
          )}
        </button>
        <InheritanceTooltip inheritedFrom={inheritedFrom} />    
    </div>
  <div className="data-value col-span-2 p-4 flex items-center">
  <code className={`break-all block transition bg-transparent ${
              showAnimation ? "bg-success rounded-sm animate-pulse-fast" : ""
            }`}>
            {displayTxResult(result)}
            </code>
  </div>
  </div>
    
  );
};
