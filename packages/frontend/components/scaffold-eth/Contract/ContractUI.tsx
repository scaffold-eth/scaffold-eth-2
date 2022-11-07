import { Contract } from "ethers";
import { useContract, useNetwork, useProvider } from "wagmi";
import {
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
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

  const { address: contractAddress, abi: contractABI } = getGeneratedContract(chain?.id.toString(), contractName);

  const contract: Contract = useContract({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    signerOrProvider: provider,
  });

  const displayedContractFunctions = getAllContractFunctions(contract);

  const contractVariablesDisplay = getContractVariablesAndNoParamsReadMethods(contract, displayedContractFunctions);

  const contractMethodsDisplay = getContractReadOnlyMethodsWithParams(contract, displayedContractFunctions);

  const contractWriteMethods = getContractWriteMethods(contract, displayedContractFunctions);

  if (!contractAddress) {
    return <p className="text-2xl text-white">No Contract found !</p>;
  }

  return (
    <div className="grid grid-cols-1  lg:grid-cols-2 gap-4 max-w-4xl">
      <div className="bg-white rounded-sm px-4 py-2 border-solid border-2">
        {contractMethodsDisplay.length ? contractMethodsDisplay : "Here Read methods with params will display"}
      </div>
      <div className="bg-white rounded-sm px-4 py-2 border-solid border-2">
        {contractWriteMethods.length ? contractWriteMethods : "Here Write methods with params will be display"}
      </div>
      <div className="bg-white rounded-sm px-4 py-2 border-solid border-2">{contractVariablesDisplay}</div>
    </div>
  );
};

export default ContractUI;
