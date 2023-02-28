import { utils } from "ethers";
import React, { Dispatch, SetStateAction, useMemo } from "react";

import { AddressInput, Bytes32Input, BytesInput, InputBase, MissingTypeInput, Uint256Input } from "../Input";

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
  const inputProps = useMemo(
    () => ({
      name: stateObjectKey,
      value: form[stateObjectKey],
      placeholder: paramType.name ? `${paramType.type} ${paramType.name}` : paramType.type,
      onChange: (value: any) => {
        const formUpdate = { ...form };
        formUpdate[stateObjectKey] = value;
        setForm(formUpdate);
      },
    }),
    [form, paramType.name, paramType.type, setForm, stateObjectKey],
  );

  switch (paramType.type) {
    case "address":
      return <AddressInput {...inputProps} />;
    case "bytes32":
      return <Bytes32Input {...inputProps} />;
    case "bytes":
      return <BytesInput {...inputProps} />;
    case "string":
      return <InputBase {...inputProps} />;
    case "uint256":
      return <Uint256Input {...inputProps} />;
    default:
      // TODO: implement missing input types such as `bytes[]`
      return <MissingTypeInput paramType={paramType} />;
  }
};
