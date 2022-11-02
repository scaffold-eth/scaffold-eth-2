import { FunctionFragment } from "ethers/lib/utils";
import ContractData from "~~/contracts/hardhat_contracts.json";
import { Contract } from "ethers";
import DisplayVariable from "~~/components/scaffold-eth/Contract/DisplayVariables";
import { Dispatch, SetStateAction } from "react";

type GeneratedContractType = {
  address: string;
  abi: [];
};

// TODO Add checks if the contract is not present at `contracts` directory
/**
 * @param chainId - deployed contract chainId
 * @param contractName - name of deployed contract
 * @returns object containing contract address and abi
 */
const getGeneratedContract = (
  chainId: string | undefined,
  contractName: string | undefined | null,
): GeneratedContractType => {
  if (!chainId || !contractName) {
    return { address: "", abi: [] };
  }

  const contractsAtChain = ContractData[chainId as keyof typeof ContractData];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // ! remove hardcoding of index 0
  const contractData: GeneratedContractType = contractsAtChain[0].contracts[contractName];

  return contractData;
};

const isQueryable = (fn: FunctionFragment): boolean => {
  return (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
};

const getAllContractFunctions = (contract: Contract) => {
  return contract ? Object.values(contract.interface.functions).filter(fn => fn.type === "function") : [];
};

const getContractVariablesAndNoParamsReadMethods = (
  contract: Contract,
  contractMethodsAndVariables: FunctionFragment[],
  refreshRequired: boolean,
  setTriggerRefresh: Dispatch<SetStateAction<boolean>>,
) => {
  return contractMethodsAndVariables.map((fn, index) => {
    const isQueryableWithNoParams =
      (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

    if (isQueryableWithNoParams) {
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
    return null;
  });
};

// ToDo.
const getContractMethodsWithParams = () => {
  return [];
};

export {
  getGeneratedContract,
  isQueryable,
  getAllContractFunctions,
  getContractVariablesAndNoParamsReadMethods,
  getContractMethodsWithParams,
};
