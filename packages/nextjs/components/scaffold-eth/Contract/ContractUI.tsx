import { Contract } from "ethers";
import { useMemo, useState } from "react";
import { useContract, useNetwork, useProvider } from "wagmi";
import Blockies from "react-blockies";
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
  getDeployedContract,
} from "./utilsContract";
import { getNetworkColor, truncateEthAddress } from "~~/utils/scaffold-eth";
import Balance from "../Balance";

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
  const [addressCopied, setAddressCopied] = useState(false);

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
        <div className="bg-white rounded-3xl shadow-md shadow-secondary border border-gray-100 collapse collapse-arrow overflow-visible flex flex-col mt-10 ">
          <input type="checkbox" className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[5.5rem] min-h-fit" />
          <div className="h-[5rem] w-[5.5rem] px-4 bg-secondary absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] collapse-title after:!top-[25%] shadow-lg shadow-secondary ">
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
        <div className="bg-white rounded-3xl shadow-md shadow-secondary border border-gray-100 mt-14 collapse collapse-arrow overflow-visible flex flex-col">
          <input type="checkbox" className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[5.5rem] min-h-fit" />
          <div className="h-[5rem] w-[5.5rem] px-4 bg-secondary absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] collapse-title after:!top-[25%] shadow-lg shadow-secondary ">
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
      <div className="row-span-1 self-start flex flex-col">
        <div className="bg-white border-gray-100 border shadow-md shadow-secondary rounded-3xl px-8 mb-6 space-y-1 py-4">
          {chain?.name && (
            <p className={`${getNetworkColor(chain.name)} font-medium my-0`}>{chain.name.toLowerCase()}</p>
          )}
          <div className="flex">
            <div className="flex items-baseline gap-1">
              <Blockies seed={contractAddress.toLowerCase()} size={3} scale={5} />
              <p className="my-0 text-gray-600 leading-none">{truncateEthAddress(contractAddress)}</p>
              {addressCopied ? (
                <ClipboardDocumentCheckIcon
                  className="text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                  aria-hidden="true"
                />
              ) : (
                <CopyToClipboard
                  text={contractAddress}
                  onCopy={() => {
                    setAddressCopied(true);
                    setTimeout(() => {
                      setAddressCopied(false);
                    }, 800);
                  }}
                >
                  <ClipboardDocumentIcon
                    className="text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                    aria-hidden="true"
                  />
                </CopyToClipboard>
              )}
              <Balance address={contractAddress} />
            </div>
          </div>
        </div>
        <div className="bg-secondary rounded-3xl px-8 py-4 shadow-lg shadow-secondary">
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
