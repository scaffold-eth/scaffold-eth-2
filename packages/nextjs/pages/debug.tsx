import type { NextPage } from "next";
import { useState } from "react";
import { ContractUI } from "~~/components/scaffold-eth";
import { useDeployedContractNames } from "~~/hooks/scaffold-eth/useDeployedContractNames";

const Debug: NextPage = () => {
  const contractNames = useDeployedContractNames();
  const [selectedContract, setSelectedContract] = useState(contractNames[0]);

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        {contractNames.length > 1 && (
          <div className="flex flex-row gap-2 w-full max-w-7xl py-8 lg:py-12 px-6 lg:px-10 pb-0 lg:pb-0 overflow-x-scroll hide-scrollbar lg:flex-wrap lg:overflow-x-auto">
            {contractNames.map(contractName => (
              <button
                className={`btn btn-secondary normal-case font-thin ${
                  contractName === selectedContract ? "bg-base-300" : "bg-base-100"
                }`}
                key={contractName}
                onClick={() => setSelectedContract(contractName)}
              >
                {contractName}
              </button>
            ))}
          </div>
        )}
        {contractNames.map(contractName => (
          <ContractUI
            key={contractName}
            contractName={contractName}
            className={contractName === selectedContract ? "" : "hidden"}
          />
        ))}
      </div>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Debug Contracts</h1>
        <p className="text-neutral">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / pages / debug.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default Debug;
