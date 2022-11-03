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

const InputUI = React.forwardRef<HTMLInputElement, IInputUI>(({ setForm, form, stateObjectKey, paramType }, ref) => {
  let buttons: ReactElement = <></>;

  if (paramType.type === "bytes32") {
    buttons = (
      // <Tooltip placement="right" title="to bytes32">
      <div
        // type="dashed"
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
      // </Tooltip>
    );
  } else if (paramType.type === "bytes") {
    buttons = (
      // <Tooltip placement="right" title="to hex">
      <div
        // type="dashed"
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
      // </Tooltip>
    );
  } else if (paramType.type === "uint256") {
    buttons = (
      // <Tooltip placement="right" title="* 10 ** 18">
      <div
        // type="dashed"
        style={{ cursor: "pointer" }}
        onClick={(): void => {
          const formUpdate = { ...form };
          formUpdate[stateObjectKey] = ethers.utils.parseEther(form[stateObjectKey]);
          setForm(formUpdate);
        }}
      >
        ✴️
      </div>
      // </Tooltip>
    );
  } else if (paramType.type === "address") {
    const possibleAddress =
      form[stateObjectKey] && form[stateObjectKey].toLowerCase && form[stateObjectKey].toLowerCase().trim();
    if (possibleAddress && possibleAddress.length === 42) {
      buttons = <Address address={possibleAddress} />;
    }
  }

  return (
    <>
      <input
        placeholder={paramType.name ? paramType.type + " " + paramType.name : paramType.type}
        autoComplete="off"
        ref={ref}
        className="input input-sm"
        name={stateObjectKey}
      />
      {buttons}
    </>
  );
});

InputUI.displayName = "InputUI";

export default InputUI;
