import type { NextPage } from "next";
import { useLocalStorage } from "usehooks-ts";
import { MetaHeader } from "~~/components/MetaHeader";
import { ContractUI } from "~~/components/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

const selectedContractStorageKey = "scaffoldEth2.selectedContract";

const Debug: NextPage = () => {
  const contractNames = getContractNames();
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
  );

  return (
    <>
      <MetaHeader
        title="Debug Contracts | Scaffold-ETH 2"
        description="Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way"
      />
      <div className="flex flex-col items-center justify-center gap-y-6 py-8 lg:gap-y-8 lg:py-12">
        {contractNames.length === 0 ? (
          <p className="mt-14 text-3xl">No contracts found!</p>
        ) : (
          <>
            {contractNames.length > 1 && (
              <div className="flex w-full max-w-7xl flex-row flex-wrap gap-2 px-6 pb-1 lg:px-10">
                {contractNames.map(contractName => (
                  <button
                    className={`btn btn-secondary btn-sm font-thin normal-case ${
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
          </>
        )}
      </div>
      <div className="mt-8 bg-secondary p-10 text-center">
        <h1 className="my-0 text-4xl">Debug Contracts</h1>
        <p className="text-neutral">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="bg-base-300 px-1 text-base font-bold italic [word-spacing:-0.5rem]">
            packages / nextjs / pages / debug.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default Debug;
