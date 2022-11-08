import { FunctionFragment } from "ethers/lib/utils";
import ContractData from "~~/contracts/hardhat_contracts.json";
import { Contract, utils } from "ethers";
import DisplayVariable from "~~/components/scaffold-eth/Contract/DisplayVariables";
import { ReadOnlyFunctionForm } from "./ReadOnlyFunctionForm";
import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";

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

const getAllContractFunctions = (contract: Contract) => {
  return contract ? Object.values(contract.interface.functions).filter(fn => fn.type === "function") : [];
};

const getContractVariablesAndNoParamsReadMethods = (
  contract: Contract,
  contractMethodsAndVariables: FunctionFragment[],
) => {
  return contractMethodsAndVariables.map((fn, index) => {
    const isQueryableWithNoParams =
      (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
    if (isQueryableWithNoParams) {
      return (
        // DV -> DisplayVariables
        <DisplayVariable key={`DV_${fn.name}_${index}`} functionFragment={fn} contractAddress={contract.address} />
      );
    }
    return null;
  });
};

const getContractReadOnlyMethodsWithParams = (contract: Contract, contractMethodsAndVariables: FunctionFragment[]) => {
  return contractMethodsAndVariables.map((fn, index) => {
    const isQueryableWithParams =
      (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length > 0;
    if (isQueryableWithParams) {
      return (
        // FFR -> FunctionFormRead
        <ReadOnlyFunctionForm
          key={`FFR_${fn.name}_${index}`}
          functionFragment={fn}
          contractAddress={contract.address}
        />
      );
    }
    return null;
  });
};

// ToDo.
const getContractWriteMethods = (contract: Contract, contractMethodsAndVariables: FunctionFragment[]) => {
  return contractMethodsAndVariables.map((fn, index) => {
    const isQueryableWithParams = fn.stateMutability === "view" || fn.stateMutability === "pure";
    if (!isQueryableWithParams) {
      // FFW -> FunctionFormWrite
      return (
        <WriteOnlyFunctionForm
          key={`FFW_${fn.name}_${index}`}
          functionFragment={fn}
          contractAddress={contract.address}
        />
      );
    }
    return null;
  });
};

const getFunctionInputKey = (functionInfo: FunctionFragment, input: utils.ParamType, inputIndex: number): string => {
  const name = input?.name ? input.name : `input_${inputIndex}_`;
  return functionInfo.name + "_" + name + "_" + input.type;
};

const getParsedEthersError = (e: any): string => {
  // Accounts for Metamask and default signer on all networks
  let message =
    e.data && e.data.message
      ? e.data.message
      : e.error && JSON.parse(JSON.stringify(e.error)).body
      ? JSON.parse(JSON.parse(JSON.stringify(e.error)).body).error.message
      : e.data
      ? e.data
      : JSON.stringify(e);
  if (!e.error && e.message) {
    message = e.message;
  }

  console.log("Attempt to clean up:", message);
  try {
    const obj = JSON.parse(message);
    if (obj && obj.body) {
      const errorObj = JSON.parse(obj.body);
      if (errorObj && errorObj.error && errorObj.error.message) {
        message = errorObj.error.message;
      }
    }
  } catch (e) {
    //ignore
  }

  return message;
};

export {
  getGeneratedContract,
  getContractReadOnlyMethodsWithParams,
  getAllContractFunctions,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
  getFunctionInputKey,
  getParsedEthersError,
};
