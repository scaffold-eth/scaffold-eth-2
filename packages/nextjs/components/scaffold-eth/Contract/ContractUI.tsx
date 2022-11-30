import { Contract } from "ethers";
import { useContract, useNetwork, useProvider } from "wagmi";
import {
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
  getDeployedContract,
} from "./utilsContract";

type TContractUIProps = {
  contractName: string;
};

/**
 * UI component to interface with deployed contracts.
 *
 * ToDo. Handle loading state
 **/
const ContractUI = ({ contractName }: TContractUIProps) => {
  const { chain } = useNetwork();
  const provider = useProvider();

  let contractAddress = "";
  let contractABI = [];
  const deployedContractData = getDeployedContract(chain?.id.toString(), contractName);

  if (deployedContractData) {
    ({ address: contractAddress, abi: contractABI } = deployedContractData);
  }

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
    return <p className="text-2xl">No Contract found !</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl items-start">
      <div className="bg-white rounded-sm px-4 py-2 border-solid border-2">
        <p className="font-semibold text-black text-2xl my-4 underline decoration-wavy underline-offset-2 decoration-violet-700 ">
          Read Functions
        </p>
        {contractMethodsDisplay?.loaded
          ? contractMethodsDisplay.methods.length > 0
            ? contractMethodsDisplay.methods
            : "No read methods"
          : "Loading read methods..."}
        <p className="font-semibold text-black text-2xl my-4 underline decoration-wavy underline-offset-2 decoration-violet-700 ">
          Write Functions
        </p>
        {contractWriteMethods?.loaded
          ? contractWriteMethods.methods.length > 0
            ? contractWriteMethods.methods
            : "No write methods"
          : "Loading write methods..."}
      </div>
      <div className="bg-white rounded-sm px-4 py-2 border-solid border-2 row-span-1">
        {contractVariablesDisplay?.loaded
          ? contractVariablesDisplay.methods.length > 0
            ? contractVariablesDisplay.methods
            : "No contract variables"
          : "Loading contract variables..."}
      </div>
    </div>
  );
};

export default ContractUI;
