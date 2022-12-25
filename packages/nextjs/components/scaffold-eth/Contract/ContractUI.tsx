import { Contract } from "ethers";
import { useMemo, useState } from "react";
import { useContract, useNetwork, useProvider } from "wagmi";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
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
  const [refreshDisplayVariables, setRefreshDisplayVariables] = useState(false);

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

  const displayedContractFunctions = useMemo(() => getAllContractFunctions(contract), [contract]);

  const contractVariablesDisplay = useMemo(() => {
    return getContractVariablesAndNoParamsReadMethods(contract, displayedContractFunctions, refreshDisplayVariables);
  }, [contract, displayedContractFunctions, refreshDisplayVariables]);

  const contractMethodsDisplay = useMemo(
    () => getContractReadOnlyMethodsWithParams(contract, displayedContractFunctions),
    [contract, displayedContractFunctions],
  );
  const contractWriteMethods = useMemo(
    () => getContractWriteMethods(contract, displayedContractFunctions, setRefreshDisplayVariables),
    [contract, displayedContractFunctions],
  );

  if (!contractAddress) {
    return <p className="text-2xl">No Contract found !</p>;
  }

  return (
    <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-10 justify-between">
      <div className="col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-3xl shadow-md shadow-secondary border border-gray-100 collapse overflow-visible flex flex-col  mt-10">
          <input type="checkbox" className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[7rem] min-h-fit" />
          <div className="h-[5rem] w-[7rem] px-6 bg-secondary absolute self-start rounded-[22px] -top-[38px] -z-10 py-2 collapse-title">
            <div className="flex items-center space-x-2 ">
              <p className="my-0 text-sm">Read</p>
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="collapse-content py-3 px-4 min-h-12 transition-all duration-200">
            {contractMethodsDisplay?.loaded
              ? contractMethodsDisplay.methods.length > 0
                ? contractMethodsDisplay.methods
                : "No read methods"
              : "Loading read methods..."}
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-md shadow-secondary border border-gray-100 mt-14 collapse overflow-visible flex flex-col">
          <input type="checkbox" className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[7rem] min-h-fit" />
          <div className="h-[5rem] w-[7rem] px-6 bg-secondary absolute self-start rounded-[22px] -top-[38px] -z-10 py-2 collapse-title">
            <div className="flex items-center space-x-2 ">
              <p className="my-0 text-sm">Write</p>
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="collapse-content py-3 px-4 min-h-12 transition-all duration-200">
            {contractWriteMethods?.loaded
              ? contractWriteMethods.methods.length > 0
                ? contractWriteMethods.methods
                : "No write methods"
              : "Loading write methods..."}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-sm px-4 py-2 border-solid border-2 row-span-1 self-start">
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
