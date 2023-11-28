import { AbiFunction, AbiParameter } from "abitype";
import { BaseError as BaseViemError } from "viem";

/**
 * Generates a key based on function metadata
 * @param {string} functionName
 * @param {AbiParameter} input - object containing function name and input type corresponding to index
 * @param {number} inputIndex
 * @returns {string} key
 */
const getFunctionInputKey = (functionName: string, input: AbiParameter, inputIndex: number): string => {
  const name = input?.name || `input_${inputIndex}_`;
  return functionName + "_" + name + "_" + input.internalType + "_" + input.type;
};

/**
 * Parses an error to get a displayable string
 * @param e - error object
 * @returns {string} parsed error string
 */
const getParsedError = (e: any | BaseViemError): string => {
  let message = e.message ?? "An unknown error occurred";

  if (e instanceof BaseViemError) {
    if (e.details) {
      message = e.details;
    } else if (e.shortMessage) {
      message = e.shortMessage;
    } else if (e.message) {
      message = e.message;
    } else if (e.name) {
      message = e.name;
    }
  }

  return message;
};

// This regex is used to identify array types in the form of `type[size]`
const ARRAY_TYPE_REGEX = /\[.*\]$/;

/**
 * Parses form input with array support
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

      if (ARRAY_TYPE_REGEX.test(baseTypeOfArg) || baseTypeOfArg === "tuple") {
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

const getInitialFormState = (abiFunction: AbiFunction) => {
  const initialForm: Record<string, any> = {};
  if (!abiFunction.inputs) return initialForm;
  abiFunction.inputs.forEach((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

export { getFunctionInputKey, getInitialFormState, getParsedContractFunctionArgs, getParsedError };
