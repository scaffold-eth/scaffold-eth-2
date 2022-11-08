import { TransactionResponse } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { BigNumber, ethers } from "ethers";
import React, { Dispatch, ReactElement, SetStateAction } from "react";
import Address from "../Address";

export const tryToDisplay = (
  element: string | number | BigNumber | Record<string, any> | TransactionResponse | undefined,
): string | ReactElement | number => {
  if (element == null) {
    return "";
  }

  let displayContent = element;
  if (
    Array.isArray(displayContent) &&
    displayContent.length === 1 &&
    (typeof displayContent[0] === "string" ||
      typeof displayContent[0] === "number" ||
      BigNumber.isBigNumber(displayContent[0]))
  ) {
    // unroll ethers.js array
    displayContent = displayContent[0];
  }

  // ! handle arrays
  if (BigNumber.isBigNumber(displayContent)) {
    try {
      return displayContent.toNumber();
    } catch (e) {
      return "Ξ" + formatUnits(displayContent, "ether");
    }
  } else if (typeof displayContent === "string" && displayContent.indexOf("0x") === 0 && displayContent.length === 42) {
    return <Address address={displayContent} />;
  } else {
    return JSON.stringify(displayContent);
  }
};

interface IUtilityButton {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any>;
  stateObjectKey: string;
}

export const ConvertStringToBytes32 = ({ form, setForm, stateObjectKey }: IUtilityButton) => {
  return (
    <div
      style={{ cursor: "pointer" }}
      onClick={(): void => {
        if (ethers.utils.isHexString(form[stateObjectKey])) {
          const formUpdate = { ...form };
          formUpdate[stateObjectKey] = ethers.utils.parseBytes32String(form[stateObjectKey]);
          setForm(formUpdate);
        } else {
          const formUpdate = { ...form };
          setForm(formUpdate);
          formUpdate[stateObjectKey] = ethers.utils.formatBytes32String(form[stateObjectKey]);
        }
      }}
    >
      #️⃣
    </div>
  );
};

export const ConvertStringToBytes = ({ form, setForm, stateObjectKey }: IUtilityButton) => {
  return (
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
};
export const ConvertUintToEther = ({ form, setForm, stateObjectKey }: IUtilityButton) => {
  return (
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
};
