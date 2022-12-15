import { FunctionFragment } from "ethers/lib/utils";
import React, { useEffect } from "react";
import { useContractRead } from "wagmi";
import { tryToDisplay } from "./utilsDisplay";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { toast } from "~~/utils";

type TDisplayVariableProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
  refreshDisplayVariables: boolean;
};

const DisplayVariable = ({ contractAddress, functionFragment, refreshDisplayVariables }: TDisplayVariableProps) => {
  const {
    data: result,
    isFetching,
    refetch,
  } = useContractRead({
    addressOrName: contractAddress,
    contractInterface: [functionFragment],
    functionName: functionFragment.name,
    args: [],
    onError: error => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  return (
    <div className="border-b-2 border-black space-y-1 pb-2">
      <div className="flex items-center gap-2">
        <h3 className="text-black text-lg mb-0">{functionFragment.name}</h3>
        <button className={`btn btn-ghost btn-xs ${isFetching && "loading"}`} onClick={async () => await refetch()}>
          {!isFetching && <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />}
        </button>
      </div>
      <div className="text-black font-normal">
        <span className="break-words block">{tryToDisplay(result)}</span>
      </div>
    </div>
  );
};

export default DisplayVariable;
