import { AbiFunction, AbiParameter } from "abitype";
import { AbiParameterTuple } from "~~/utils/scaffold-eth/contract";

/**
 * Generates a key based on function metadata
 */
const getFunctionInputKey = (functionName: string, input: AbiParameter, inputIndex: number): string => {
  const name = input?.name || `input_${inputIndex}_`;
  return functionName + "_" + name + "_" + input.internalType + "_" + input.type;
};

const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};

const isBigInt = (str: string) => {
  if (str.trim().length === 0 || str.startsWith("0")) return false;
  try {
    BigInt(str);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};

// Recursive function to deeply parse JSON strings, correctly handling nested arrays and encoded JSON strings
const deepParseValues = (value: any): any => {
  if (typeof value === "string") {
    // first try with bigInt because we losse precision with JSON.parse
    if (isBigInt(value)) {
      return BigInt(value);
    }

    if (isJsonString(value)) {
      const parsed = JSON.parse(value);
      return deepParseValues(parsed);
    }

    // It's a string but not a JSON string, return as is
    return value;
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

const getInitialTupleFormState = (abiTupleParameter: AbiParameterTuple) => {
  const initialForm: Record<string, any> = {};
  if (abiTupleParameter.components.length === 0) return initialForm;

  abiTupleParameter.components.forEach((component, componentIndex) => {
    const key = getFunctionInputKey(abiTupleParameter.name || "tuple", component, componentIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

const getInitialTupleArrayFormState = (abiTupleParameter: AbiParameterTuple) => {
  const initialForm: Record<string, any> = {};
  if (abiTupleParameter.components.length === 0) return initialForm;
  abiTupleParameter.components.forEach((component, componentIndex) => {
    const key = getFunctionInputKey("0_" + abiTupleParameter.name || "tuple", component, componentIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

const adjustInput = (input: AbiParameterTuple): AbiParameter => {
  if (input.type.startsWith("tuple[")) {
    const depth = (input.type.match(/\[\]/g) || []).length;
    return {
      ...input,
      components: transformComponents(input.components, depth, {
        internalType: input.internalType || "struct",
        name: input.name,
      }),
    };
  } else if (input.components) {
    return {
      ...input,
      components: input.components.map(value => adjustInput(value as AbiParameterTuple)),
    };
  }
  return input;
};

const transformComponents = (
  components: readonly AbiParameter[],
  depth: number,
  parentComponentData: { internalType?: string; name?: string },
): AbiParameter[] => {
  // Base case: if depth is 1 or no components, return the original components
  if (depth === 1 || !components) {
    return [...components];
  }

  // Recursive case: wrap components in an additional tuple layer
  const wrappedComponents: AbiParameter = {
    internalType: `${parentComponentData.internalType || "struct"}`.replace(/\[\]/g, "") + "[]".repeat(depth - 1),
    name: `${parentComponentData.name || "tuple"}`,
    type: `tuple${"[]".repeat(depth - 1)}`,
    components: transformComponents(components, depth - 1, parentComponentData),
  };

  return [wrappedComponents];
};

const transformAbiFunction = (abiFunction: AbiFunction): AbiFunction => {
  return {
    ...abiFunction,
    inputs: abiFunction.inputs.map(value => adjustInput(value as AbiParameterTuple)),
  };
};

export {
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  getInitialTupleFormState,
  getInitialTupleArrayFormState,
  transformAbiFunction,
};
