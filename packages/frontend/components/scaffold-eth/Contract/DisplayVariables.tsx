import { FunctionFragment } from "ethers/lib/utils";
import React, { useState } from "react";
import { useContractRead } from "wagmi";
import ErrorToast from "~~/components/ErrorToast";
import { tryToDisplay } from "./displayUtils";
// import { ArrowPathRounded } from "@heroicons/react";

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
      <h3 className="text-black text-lg">{functionFragment.name}</h3>
      <div className="text-black font-normal">
        <span className="break-words block">{tryToDisplay(result)}</span>
        <button className={`btn btn-primary btn-xs ${isFetching && "loading"}`} onClick={async () => await refetch()}>
          {!isFetching && (
            // Loop Arrows SVG
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <ErrorToast errorMessage={error} />}
    </div>
  );
};

export default DisplayVariable;
