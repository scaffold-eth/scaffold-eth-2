import { Contract } from "ethers";
import { useMemo, useState } from "react";
import { useContract, useNetwork, useProvider } from "wagmi";
import {
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
  getDeployedContract,
} from "./utilsContract";
import { getNetworkDetailsByChainId } from "~~/utils/scaffold-eth";
import { Balance, Address } from "~~/components/scaffold-eth";

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
        <div className="z-10">
          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-200/50 collapse collapse-arrow overflow-visible flex flex-col mt-10 ">
            <input
              type="checkbox"
              className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[5.5rem] min-h-fit"
              defaultChecked
            />
            <div className="h-[5rem] w-[5.5rem] px-4 bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] collapse-title after:!top-[25%] shadow-lg shadow-base-300">
              <div className="flex items-center space-x-2">
                <p className="my-0 text-sm">Read</p>
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
        </div>
        <div className="z-10">
          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-200/50 mt-14 collapse collapse-arrow overflow-visible flex flex-col">
            <input
              type="checkbox"
              className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[5.5rem] min-h-fit"
              defaultChecked
            />
            <div className="h-[5rem] w-[5.5rem] px-4 bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] collapse-title after:!top-[25%] shadow-lg shadow-base-300">
              <div className="flex items-center space-x-2 ">
                <p className="my-0 text-sm">Write</p>
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
      </div>
      <div className="row-span-1 self-start flex flex-col">
        <div className="bg-base-100 border-base-200/50 border shadow-md shadow-secondary rounded-3xl px-8 mb-6 space-y-1 py-4">
          {chain && (
            <p className="font-medium my-0" style={{ color: getNetworkDetailsByChainId(chain.id)?.color }}>
              {chain.name}
            </p>
          )}
          <div className="flex">
            <div className="flex gap-1">
              <Address address={contractAddress} />
              <Balance address={contractAddress} />
            </div>
          </div>
        </div>
        <div className="bg-base-300 rounded-3xl px-8 py-4 shadow-lg shadow-base-300">
          {contractVariablesDisplay?.loaded
            ? contractVariablesDisplay.methods.length > 0
              ? contractVariablesDisplay.methods
              : "No contract variables"
            : "Loading contract variables..."}
        </div>
      </div>
    </div>
  );
};

export default ContractUI;
