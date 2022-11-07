import { FunctionFragment } from "ethers/lib/utils";
import React, { useState } from "react";
import { useContractRead } from "wagmi";
import ErrorToast from "~~/components/ErrorToast";
import { tryToDisplay } from "./displayUtils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

type DisplayVariableProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
};

const DisplayVariable = ({ contractAddress, functionFragment }: DisplayVariableProps) => {
  const [error, setError] = useState("");

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
      setError(error.message);
      setTimeout(() => {
        setError("");
      }, 3000);
    },
  });

  // TODO use SVGComponent from @heroicons instead
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
      {error && <ErrorToast errorMessage={error} />}
    </div>
  );
};

export default DisplayVariable;
