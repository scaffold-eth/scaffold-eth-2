"use client";

import { Dispatch, SetStateAction } from "react";
import { Tuple } from "./Tuple";
import { TupleArray } from "./TupleArray";
import { AbiParameter } from "abitype";
import {
  AddressInput,
  Bytes32Input,
  BytesInput,
  InputBase,
  IntegerInput,
  IntegerVariant,
} from "~~/components/scaffold-eth";

type ContractInputProps = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any> | undefined;
  stateObjectKey: string;
  paramType: AbiParameter;
};

const convertToMultiDimensionalComponents = (
  param: Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>,
): Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }> & { isVirtual?: true } => {
  // Determine the depth of the array based on the number of brackets in the type
  const depth = (param.type.match(/\[\]/g) || []).length;

  if (depth <= 1) {
    // No conversion needed if it's not at least a two-dimensional array
    return param;
  } else {
    // Start conversion for 2 or more dimensions
    const modifiedParam = { ...param }; // Shallow copy for modification
    let currentComponents = modifiedParam.components;

    for (let i = 1; i < depth; i++) {
      // Start from 1 since the original already represents the first level
      const wrapperComponent = {
        components: currentComponents,
        internalType: modifiedParam.internalType,
        name: `nested_${i}`, // You can customize the naming logic here
        type: `tuple${"[]".repeat(depth - i)}`, // Adjust type to match the current nesting level
        isVirtual: true,
      };
      currentComponents = [wrapperComponent]; // Wrap the current components
    }

    modifiedParam.components = currentComponents;
    return modifiedParam;
  }
};

/**
 * Generic Input component to handle input's based on their function param type
 */
export const ContractInput = ({ setForm, form, stateObjectKey, paramType }: ContractInputProps) => {
  const inputProps = {
    name: stateObjectKey,
    value: form?.[stateObjectKey],
    placeholder: paramType.name ? `${paramType.type} ${paramType.name}` : paramType.type,
    onChange: (value: any) => {
      setForm(form => ({ ...form, [stateObjectKey]: value }));
    },
  };

  if (paramType.type === "address") {
    return <AddressInput {...inputProps} />;
  } else if (paramType.type === "bytes32") {
    return <Bytes32Input {...inputProps} />;
  } else if (paramType.type === "bytes") {
    return <BytesInput {...inputProps} />;
  } else if (paramType.type === "string") {
    return <InputBase {...inputProps} />;
  } else if (paramType.type.includes("int") && !paramType.type.includes("[")) {
    return <IntegerInput {...inputProps} variant={paramType.type as IntegerVariant} />;
  } else if (paramType.type === "tuple") {
    return (
      <Tuple
        setParentForm={setForm}
        parentForm={form}
        abiTupleParameter={paramType as Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>}
        parentStateObjectKey={stateObjectKey}
      />
    );
  } else if (paramType.type.startsWith("tuple[")) {
    const modifiedParam = convertToMultiDimensionalComponents(
      paramType as Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>,
    );

    return (
      <TupleArray
        setParentForm={setForm}
        parentForm={form}
        abiTupleParameter={modifiedParam}
        parentStateObjectKey={stateObjectKey}
      />
    );
  }

  return <InputBase {...inputProps} />;
};
