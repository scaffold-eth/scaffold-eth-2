import { useState } from "react";
import { Contract } from "ethers";
import { useContract, useNetwork, useProvider } from "wagmi";
import {
  getAllContractFunctions,
  getContractMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getGeneratedContract,
} from "./utils";

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
const ContractUI = ({ contractName }: ContractProps) => {
  const { chain } = useNetwork();
  const provider = useProvider();
  const [refreshRequired, setTriggerRefresh] = useState(false);

  const { address: contractAddress, abi: contractABI } = getGeneratedContract(chain?.id.toString(), contractName);

  const contract: Contract = useContract({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    signerOrProvider: provider,
  });

  const displayedContractFunctions = getAllContractFunctions(contract);
  const contractVariablesDisplay = getContractVariablesAndNoParamsReadMethods(
    contract,
    displayedContractFunctions,
    refreshRequired,
    setTriggerRefresh,
  );

  // ToDo.
  const contractMethodsDisplay = getContractMethodsWithParams();

  if (!contractAddress) {
    return <p className="text-2xl text-white">No Contract found !</p>;
  }

  return (
    <div className="flex gap-4">
      <div className="w-1/2 bg-white rounded-sm px-4 py-2 border-solid border-2">
        {contractMethodsDisplay.length ? contractMethodsDisplay : "Here Read/Write methods with params will display"}
      </div>
      <div className=" w-1/2 bg-white rounded-sm px-4 py-2 border-solid border-2">{contractVariablesDisplay}</div>
    </div>
  );
};

export default ContractUI;
