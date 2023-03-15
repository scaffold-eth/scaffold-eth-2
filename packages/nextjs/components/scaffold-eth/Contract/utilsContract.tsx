import { Dispatch, SetStateAction } from "react";
import { Contract, utils } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { DisplayVariable, ReadOnlyFunctionForm, WriteOnlyFunctionForm } from "~~/components/scaffold-eth";

/**
 * @param {Contract} contract
 * @returns {FunctionFragment[]} array of function fragments
 */
const getAllContractFunctions = (contract: Contract | null): FunctionFragment[] => {
  return contract ? Object.values(contract.interface.functions).filter(fn => fn.type === "function") : [];
};

/**
 * @dev used to filter all readOnly functions with zero params
 * @param {Contract} contract
 * @param {FunctionFragment[]} contractMethodsAndVariables - array of all functions in the contract
 * @param {boolean} refreshDisplayVariables refetch values
 * @returns { methods: (JSX.Element | null)[] } array of DisplayVariable component
 * which has corresponding input field for param type and button to read
 */
const getContractVariablesAndNoParamsReadMethods = (
  contract: Contract | null,
  contractMethodsAndVariables: FunctionFragment[],
  refreshDisplayVariables: boolean,
): { methods: (JSX.Element | null)[] } => {
  return {
    methods: contract
      ? contractMethodsAndVariables
          .map(fn => {
            const isQueryableWithNoParams =
              (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
            if (isQueryableWithNoParams) {
              return (
                <DisplayVariable
                  key={fn.name}
                  functionFragment={fn}
                  contractAddress={contract.address}
                  refreshDisplayVariables={refreshDisplayVariables}
                />
              );
            }
            return null;
          })
          .filter(n => n)
      : [],
  };
};

/**
 * @dev used to filter all readOnly functions with greater than or equal to 1 params
 * @param {Contract} contract
 * @param {FunctionFragment[]} contractMethodsAndVariables - array of all functions in the contract
 * @returns { methods: (JSX.Element | null)[] } array of ReadOnlyFunctionForm component
 * which has corresponding input field for param type and button to read
 */
const getContractReadOnlyMethodsWithParams = (
  contract: Contract | null,
  contractMethodsAndVariables: FunctionFragment[],
): { methods: (JSX.Element | null)[] } => {
  return {
    methods: contract
      ? contractMethodsAndVariables
          .map((fn, idx) => {
            const isQueryableWithParams =
              (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length > 0;
            if (isQueryableWithParams) {
              return (
                <ReadOnlyFunctionForm
                  key={`${fn.name}-${idx}`}
                  functionFragment={fn}
                  contractAddress={contract.address}
                />
              );
            }
            return null;
          })
          .filter(n => n)
      : [],
  };
};

/**
 * @dev used to filter all write functions
 * @param {Contract} contract
 * @param {FunctionFragment[]} contractMethodsAndVariables - array of all functions in the contract
 * @param {Dispatch<SetStateAction<boolean>>} setRefreshDisplayVariables - trigger variable refresh
 * @returns {  methods: (JSX.Element | null)[] } array of WriteOnlyFunctionForm component
 * which has corresponding input field for param type, txnValue input if required and button to send transaction
 */
const getContractWriteMethods = (
  contract: Contract | null,
  contractMethodsAndVariables: FunctionFragment[],
  setRefreshDisplayVariables: Dispatch<SetStateAction<boolean>>,
): { methods: (JSX.Element | null)[] } => {
  return {
    methods: contract
      ? contractMethodsAndVariables
          .map((fn, idx) => {
            const isWriteableFunction = fn.stateMutability !== "view" && fn.stateMutability !== "pure";
            if (isWriteableFunction) {
              return (
                <WriteOnlyFunctionForm
                  key={`${fn.name}-${idx}`}
                  functionFragment={fn}
                  contractAddress={contract.address}
                  setRefreshDisplayVariables={setRefreshDisplayVariables}
                />
              );
            }
            return null;
          })
          .filter(n => n)
      : [],
  };
};

/**
 * @dev utility function to generate key corresponding to function metaData
 * @param {FunctionFragment} functionInfo
 * @param {utils.ParamType} input - object containing function name and input type corresponding to index
 * @param {number} inputIndex
 * @returns {string} key
 */
const getFunctionInputKey = (functionInfo: FunctionFragment, input: utils.ParamType, inputIndex: number): string => {
  const name = input?.name || `input_${inputIndex}_`;
  return functionInfo.name + "_" + name + "_" + input.type + "_" + input.baseType;
};

/**
 * @dev utility function to parse error thrown by ethers
 * @param e - ethers error object
 * @returns {string} parsed error string
 */
const getParsedEthersError = (e: any): string => {
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

/**
 * @dev Parse form input with array support
 * @param {Record<string,any>} form - form object containing key value pairs
 * @returns  parsed error string
 */
const getParsedContractFunctionArgs = (form: Record<string, any>) => {
  const keys = Object.keys(form);
  const parsedArguments = keys.map(key => {
    try {
      const keySplitArray = key.split("_");
      const baseTypeOfArg = keySplitArray[keySplitArray.length - 1];
      let valueOfArg = form[key];

      if (["array", "tuple"].includes(baseTypeOfArg)) {
        valueOfArg = JSON.parse(valueOfArg);
      } else if (baseTypeOfArg === "bool") {
        if (["true", "1", "0x1", "0x01", "0x0001"].includes(valueOfArg)) {
          valueOfArg = 1;
        } else {
          valueOfArg = 0;
        }
      }
      return valueOfArg;
    } catch (error: any) {
      // ignore error, it will be handled when sending/reading from a function
    }
  });
  return parsedArguments;
};

export {
  getAllContractFunctions,
  getContractReadOnlyMethodsWithParams,
  getContractVariablesAndNoParamsReadMethods,
  getContractWriteMethods,
  getFunctionInputKey,
  getParsedContractFunctionArgs,
  getParsedEthersError,
};
