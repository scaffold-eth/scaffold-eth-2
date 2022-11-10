import { FunctionFragment } from "ethers/lib/utils";
import React, { Dispatch, ReactElement, SetStateAction } from "react";
import Address from "../Address";
import AddressInput from "../AddressInput";
import { ConvertStringToBytes, ConvertStringToBytes32, ConvertUintToEther } from "./utilsDisplay";

type ParamType = {
  name: string | null;
  type: string;
};

interface IInputUI {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any>;
  stateObjectKey: string;
  paramType: ParamType;
  functionFragment: FunctionFragment;
}

/**
 * Generic Input component to handle input's based on their function param type
 */
const InputUI = ({ setForm, form, stateObjectKey, paramType }: IInputUI) => {
  let buttons: ReactElement = <></>;

  switch (paramType.type) {
    case "bytes32":
      buttons = <ConvertStringToBytes32 setForm={setForm} form={form} stateObjectKey={stateObjectKey} />;
      break;

    case "bytes":
      buttons = <ConvertStringToBytes setForm={setForm} form={form} stateObjectKey={stateObjectKey} />;
      break;

    case "uint256":
      buttons = <ConvertUintToEther setForm={setForm} form={form} stateObjectKey={stateObjectKey} />;
      break;

    case "address":
      const possibleAddress =
        form[stateObjectKey] && form[stateObjectKey].toLowerCase && form[stateObjectKey].toLowerCase().trim();
      if (possibleAddress && possibleAddress.length === 42) {
        buttons = <Address address={possibleAddress} />;
      }
      break;
  }

  return (
    <div className="flex space-x-2 items-end">
      {paramType.type === "address" ? (
        <AddressInput
          placeholder={paramType.name ? paramType.type + " " + paramType.name : paramType.type}
          name={stateObjectKey}
          value={form[stateObjectKey]}
          onChange={(value): void => {
            const formUpdate = { ...form };
            formUpdate[stateObjectKey] = value;
            setForm(formUpdate);
          }}
        />
      ) : (
        <input
          placeholder={paramType.name ? paramType.type + " " + paramType.name : paramType.type}
          autoComplete="off"
          className="input input-bordered"
          name={stateObjectKey}
          value={form[stateObjectKey]}
          onChange={(event): void => {
            const formUpdate = { ...form };
            formUpdate[event.target.name] = event.target.value;
            setForm(formUpdate);
          }}
        />
      )}

      {buttons}
    </div>
  );
};

export default InputUI;
