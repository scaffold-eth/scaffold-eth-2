import { FunctionFragment } from "ethers/lib/utils";
import React, { Dispatch, ReactElement, SetStateAction } from "react";
import { AddressInput } from "~~/components/scaffold-eth";

import { StringToBytesConverter, StringToBytes32Converter, UintToEtherConverter } from "./utilsDisplay";

type ParamType = {
  name: string | null;
  type: string;
};

type TInputUIProps = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any>;
  stateObjectKey: string;
  paramType: ParamType;
  functionFragment: FunctionFragment;
};

/**
 * Generic Input component to handle input's based on their function param type
 */
const InputUI = ({ setForm, form, stateObjectKey, paramType }: TInputUIProps) => {
  let inputSuffix: ReactElement = <></>;

  switch (paramType.type) {
    case "bytes32":
      inputSuffix = <StringToBytes32Converter setForm={setForm} form={form} stateObjectKey={stateObjectKey} />;
      break;

    case "bytes":
      inputSuffix = <StringToBytesConverter setForm={setForm} form={form} stateObjectKey={stateObjectKey} />;
      break;

    case "uint256":
      inputSuffix = <UintToEtherConverter setForm={setForm} form={form} stateObjectKey={stateObjectKey} />;
      break;
  }

  return (
    <div className="flex items-end border-2 border-base-300 bg-base-200 rounded-full text-accent justify-between">
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
          className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
          name={stateObjectKey}
          value={form[stateObjectKey]}
          onChange={(event): void => {
            const formUpdate = { ...form };
            formUpdate[event.target.name] = event.target.value;
            setForm(formUpdate);
          }}
        />
      )}

      {inputSuffix}
    </div>
  );
};

export default InputUI;
