import { Contract } from "ethers";
import { useMemo, useState } from "react";
import { useContract, useProvider } from "wagmi";
import {
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
} from "./utilsContract";
import { Balance, Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useNetworkColor } from "~~/utils/scaffold-eth/useNetworkColor";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

type TContractUIProps = {
  contractName: string;
};

/**
 * UI component to interface with deployed contracts.
 *
 * ToDo. Handle loading state
 **/
const ContractUI = ({ contractName }: TContractUIProps) => {
  const configuredChain = getTargetNetwork();
  const provider = useProvider();
  const [refreshDisplayVariables, setRefreshDisplayVariables] = useState(false);

  let contractAddress = "";
  let contractABI = [];
  const deployedContractData = useDeployedContractInfo(contractName);
  const networkColor = useNetworkColor(configuredChain.id);
  if (deployedContractData) {
    ({ address: contractAddress, abi: contractABI } = deployedContractData);
  }

  const contract: Contract | null = useContract({
    address: contractAddress,
    abi: contractABI,
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
    return <p className="text-3xl mt-14">No Contract found!</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 py-12 px-10 lg:gap-12 w-full max-w-7xl my-0">
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <Address address={contractAddress} />
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-sm">Balance:</span>
                  <Balance address={contractAddress} className="px-0 h-1.5 min-h-[0.375rem]" />
                </div>
              </div>
            </div>
            {configuredChain && (
              <p className="my-0 text-sm">
                <span className="font-bold">Network</span>:{" "}
                <span style={{ color: networkColor }}>{configuredChain.name}</span>
              </p>
            )}
          </div>
          <div className="bg-base-300 rounded-3xl px-8 py-4 shadow-lg shadow-base-300">
            {contractVariablesDisplay.methods.length > 0 ? contractVariablesDisplay.methods : "No contract variables"}
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 collapse collapse-arrow overflow-visible flex flex-col mt-10 ">
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
                {contractMethodsDisplay.methods.length > 0 ? contractMethodsDisplay.methods : "No read methods"}
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 mt-14 collapse collapse-arrow overflow-visible flex flex-col">
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
                {contractWriteMethods.methods.length > 0 ? contractWriteMethods.methods : "No write methods"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractUI;
