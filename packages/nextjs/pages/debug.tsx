import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { ContractUI } from "~~/components/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

const storage: { get: () => ContractName; set: (data: ContractName) => void } = {
  get() {
    try {
      const hasOwnContract = window.localStorage.getItem("userSelectedContract");

      if (hasOwnContract === null || hasOwnContract === "") {
        return [];
      }

      return JSON.parse(hasOwnContract);
    } catch (error) {
      console.log(`Get data from LocalStorage isn't allowed. ${error}`);
      return [];
    }
  },

  set(data) {
    try {
      window.localStorage.setItem("userSelectedContract", JSON.stringify(data));
    } catch (error) {
      console.log(`Set data to LocalStorage isn't allowed. ${error}`);
    }
  },
};

const Debug: NextPage = () => {
  const contractNames = getContractNames();
  const [selectedContract, setSelectedContract] = useState<ContractName>(contractNames[0]);

  useEffect(() => {
    const userSelectedContract = storage.get();

    if (typeof userSelectedContract === "string") {
      setSelectedContract(userSelectedContract);
    }
  }, []);

  const onSelectContract = useCallback((contractName: ContractName) => {
    setSelectedContract(contractName);

    storage.set(contractName);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
        {contractNames.length === 0 ? (
          <p className="text-3xl mt-14">No contracts found!</p>
        ) : (
          <>
            {contractNames.length > 1 && (
              <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                {contractNames.map(contractName => (
                  <button
                    className={`btn btn-secondary btn-sm normal-case font-thin ${
                      contractName === selectedContract ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={contractName}
                    onClick={() => onSelectContract(contractName)}
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
          </>
        )}
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
