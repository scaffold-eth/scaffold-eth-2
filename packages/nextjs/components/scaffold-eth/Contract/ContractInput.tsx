import { utils } from "ethers";
import React, { Dispatch, SetStateAction } from "react";
import { AddressInput } from "../Input/AddressInput";
import { Bytes32Input } from "../Input/Bytes32Input";
import { BytesInput } from "../Input/BytesInput";
import { InputBase } from "../Input/InputBase";
import { IntegerInput } from "../Input/IntegerInput";
import { IntegerVariant } from "../Input/utils";

type ContractInputProps = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any>;
  stateObjectKey: string;
  paramType: utils.ParamType;
};

/**
 * Generic Input component to handle input's based on their function param type
 */
export const ContractInput = ({ setForm, form, stateObjectKey, paramType }: ContractInputProps) => {
  const inputProps = {
    name: stateObjectKey,
    value: form[stateObjectKey],
    placeholder: paramType.name ? `${paramType.type} ${paramType.name}` : paramType.type,
    onChange: (value: any) => {
      const formUpdate = { ...form };
      formUpdate[stateObjectKey] = value;
      setForm(formUpdate);
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
  } else if (paramType.type.includes("int") && !paramType.type.includes("[]")) {
    return <IntegerInput {...inputProps} variant={paramType.type as IntegerVariant} />;
  }

  return <InputBase {...inputProps} />;
};
