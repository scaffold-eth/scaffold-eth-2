import { ContractFunction } from "ethers";
import { useState } from "react";
import { useContract, useNetwork, useProvider } from "wagmi";
import DisplayVariable from "./DisplayVariables";
import { getAllContractFunctions, getGeneratedContract, isQueryable } from "./utils";

type ContractProps = {
  contractName: string;
};

/**
 * TODO
 * handle error
 * handle types correctly
 * handle loading state
 * handle payable, public, functions
 **/
const Contract = ({ contractName }: ContractProps) => {
  const { chain } = useNetwork();
  const provider = useProvider();
  const [refreshRequired, setTriggerRefresh] = useState(false);

  const { address: contractAddress, abi: contractABI } = getGeneratedContract(chain?.id.toString(), contractName);

  const contract = useContract({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    signerOrProvider: provider,
  });

  const displayedContractFunctions = getAllContractFunctions(contract);

  // TODO abstract this too in other file(future)
  const contractDisplay = displayedContractFunctions.map((fn, index) => {
    const contractFunc: ContractFunction<any> =
      fn.stateMutability === "view" || fn.stateMutability === "pure" ? contract?.functions[fn.name] : null;

    if (typeof contractFunc === "function") {
      if (isQueryable(fn)) {
        return (
          <DisplayVariable
            key={`${fn.name}_${index}`}
            contractFunction={contract?.functions[fn.name]}
            functionInfo={fn}
            refreshRequired={refreshRequired}
            setTriggerRefresh={setTriggerRefresh}
          />
        );
      }
    }
    return null;
  });

  if (!contractAddress) {
    return <p className="text-2xl text-white">No Contract found !</p>;
  }

  return (
    <div>
      <div className="bg-white rounded-sm px-4 py-2">{contractDisplay}</div>
    </div>
  );
};

export default Contract;
