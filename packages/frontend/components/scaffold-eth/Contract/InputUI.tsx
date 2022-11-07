import { ethers } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import React, { Dispatch, ReactElement, SetStateAction } from "react";
import Address from "../Address";

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

// TODO use AddressInput component instead
const InputUI = ({ setForm, form, stateObjectKey, paramType }: IInputUI) => {
  let buttons: ReactElement = <></>;

  // TODO maybe abstract each `div` as a small util Component, use switch case and cleanUp
  // TODO handle when input filed is empty
  if (paramType.type === "bytes32") {
    buttons = (
      <div
        style={{ cursor: "pointer" }}
        onClick={(): void => {
          if (ethers.utils.isHexString(form[stateObjectKey])) {
            const formUpdate = { ...form };
            formUpdate[stateObjectKey] = ethers.utils.parseBytes32String(form[stateObjectKey]);
            setForm(formUpdate);
          } else {
            const formUpdate = { ...form };
            formUpdate[stateObjectKey] = ethers.utils.formatBytes32String(form[stateObjectKey]);
            setForm(formUpdate);
          }
        }}
      >
        #️⃣
      </div>
    );
  } else if (paramType.type === "bytes") {
    buttons = (
      <div
        style={{ cursor: "pointer" }}
        onClick={(): void => {
          if (ethers.utils.isHexString(form[stateObjectKey])) {
            const formUpdate = { ...form };
            formUpdate[stateObjectKey] = ethers.utils.toUtf8String(form[stateObjectKey]);
            setForm(formUpdate);
          } else {
            const formUpdate = { ...form };
            formUpdate[stateObjectKey] = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(form[stateObjectKey]));
            setForm(formUpdate);
          }
        }}
      >
        #️⃣
      </div>
    );
  } else if (paramType.type === "uint256") {
    buttons = (
      <div
        style={{ cursor: "pointer" }}
        onClick={(): void => {
          const formUpdate = { ...form };
          formUpdate[stateObjectKey] = ethers.utils.parseEther(form[stateObjectKey]);
          setForm(formUpdate);
        }}
      >
        ✴️
      </div>
    );
  } else if (paramType.type === "address") {
    const possibleAddress =
      form[stateObjectKey] && form[stateObjectKey].toLowerCase && form[stateObjectKey].toLowerCase().trim();
    if (possibleAddress && possibleAddress.length === 42) {
      buttons = <Address address={possibleAddress} />;
    }
  }

  return (
    <div className="flex space-x-2 items-center">
      <input
        placeholder={paramType.name ? paramType.type + " " + paramType.name : paramType.type}
        autoComplete="off"
        className="input input-sm"
        name={stateObjectKey}
        value={form[stateObjectKey]}
        onChange={(event): void => {
          const formUpdate = { ...form };
          formUpdate[event.target.name] = event.target.value;
          setForm(formUpdate);
        }}
      />
      {buttons}
    </div>
  );
};

export default InputUI;
