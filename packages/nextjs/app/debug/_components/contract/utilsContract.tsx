import { AbiFunction, AbiParameter } from "abitype";

/**
 * Generates a key based on function metadata
 */
const getFunctionInputKey = (functionName: string, input: AbiParameter, inputIndex: number): string => {
  const name = input?.name || `input_${inputIndex}_`;
  return functionName + "_" + name + "_" + input.internalType + "_" + input.type;
};

// This regex is used to identify array types in the form of `type[size]`
// const ARRAY_TYPE_REGEX = /\[.*\]$/;

// Regular expression to detect if a string is JSON
const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Recursive function to deeply parse JSON strings, correctly handling nested arrays and encoded JSON strings
const deepParseValues = (value: any): any => {
  if (typeof value === "string") {
    if (isJsonString(value)) {
      const parsed = JSON.parse(value);
      return deepParseValues(parsed); // Recursively parse the decoded value
    } else {
      // It's a string but not a JSON string, return as is
      return value;
    }
  } else if (Array.isArray(value)) {
    // If it's an array, recursively parse each element
    return value.map(element => deepParseValues(element));
  } else if (typeof value === "object" && value !== null) {
    // If it's an object, recursively parse each value
    return Object.entries(value).reduce((acc: any, [key, val]) => {
      acc[key] = deepParseValues(val);
      return acc;
    }, {});
  }

  // Handle boolean values represented as strings
  if (value === "true" || value === "1" || value === "0x1" || value === "0x01" || value === "0x0001") {
    return true;
  } else if (value === "false" || value === "0" || value === "0x0" || value === "0x00" || value === "0x0000") {
    return false;
  }
  // If none of the above, return the value as is (covers numbers, booleans, etc.)
  return value;
};

/**
 * parses form input with array support
 */
const getParsedContractFunctionArgs = (form: Record<string, any>) => {
  return Object.keys(form).map(key => {
    const valueOfArg = form[key];

    // Attempt to deeply parse JSON strings
    return deepParseValues(valueOfArg);
  });
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

const getInitalTupleFormState = (abiTupleParameter: Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>) => {
  const initialForm: Record<string, any> = {};
  if (abiTupleParameter.components.length === 0) return initialForm;

  abiTupleParameter.components.forEach((component, componentIndex) => {
    const key = getFunctionInputKey(abiTupleParameter.name || "tuple", component, componentIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

const getInitalTupleArrayFormState = (
  abiTupleParameter: Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>,
) => {
  const initialForm: Record<string, any> = {};
  if (abiTupleParameter.components.length === 0) return initialForm;
  abiTupleParameter.components.forEach((component, componentIndex) => {
    const key = getFunctionInputKey("0_" + abiTupleParameter.name || "tuple", component, componentIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

export {
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  getInitalTupleFormState,
  getInitalTupleArrayFormState,
};
