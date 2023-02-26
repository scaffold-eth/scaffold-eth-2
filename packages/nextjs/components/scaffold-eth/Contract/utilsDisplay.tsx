import { TransactionResponse } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { BigNumber, ethers } from "ethers";
import React, { Dispatch, ReactElement, SetStateAction, useCallback } from "react";
import { Address } from "~~/components/scaffold-eth";

type DisplayContent = string | number | BigNumber | Record<string, any> | TransactionResponse | undefined | unknown;

export const displayTxResult = (
  displayContent: DisplayContent | DisplayContent[],
  asText = false,
): string | ReactElement | number => {
  if (displayContent == null) {
    return "";
  }

  if (displayContent && BigNumber.isBigNumber(displayContent)) {
    try {
      return displayContent.toNumber();
    } catch (e) {
      return "Ξ" + formatUnits(displayContent, "ether");
    }
  }

  if (typeof displayContent === "string" && displayContent.indexOf("0x") === 0 && displayContent.length === 42) {
    return asText ? displayContent : <Address address={displayContent} />;
  }

  if (displayContent && Array.isArray(displayContent)) {
    const mostReadable = (v: DisplayContent) =>
      ["number", "boolean"].includes(typeof v) ? v : displayTxResultAsText(v);
    const displayable = JSON.stringify(displayContent.map(mostReadable));

    return asText ? (
      displayable
    ) : (
      <span style={{ overflowWrap: "break-word", width: "100%" }}>{displayable.replaceAll(",", ",\n")}</span>
    );
  }

  return JSON.stringify(displayContent, null, 2);
};

const displayTxResultAsText = (displayContent: DisplayContent) => displayTxResult(displayContent, true);

interface IUtilityButton {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any>;
  stateObjectKey: string;
}

export const StringToBytes32Converter = ({ form, setForm, stateObjectKey }: IUtilityButton) => {
  const convertStringToBytes32 = useCallback((): void => {
    const formUpdate = {
      ...form,
      [stateObjectKey]: ethers.utils.isHexString(form[stateObjectKey])
        ? ethers.utils.parseBytes32String(form[stateObjectKey])
        : ethers.utils.formatBytes32String(form[stateObjectKey]),
    };
    setForm(formUpdate);
  }, [form, setForm, stateObjectKey]);
  return (
    <div className="cursor-pointer text-xl font-semibold px-4 text-accent" onClick={convertStringToBytes32}>
      #
    </div>
  );
};

export const StringToBytesConverter = ({ form, setForm, stateObjectKey }: IUtilityButton) => {
  const convertStringToBytes = useCallback(() => {
    const formUpdate = {
      ...form,
      [stateObjectKey]: ethers.utils.isHexString(form[stateObjectKey])
        ? ethers.utils.toUtf8String(form[stateObjectKey])
        : ethers.utils.hexlify(ethers.utils.toUtf8Bytes(form[stateObjectKey])),
    };
    setForm(formUpdate);
  }, [form, setForm, stateObjectKey]);

  return (
    <div className="cursor-pointer text-xl font-semibold px-4 text-accent" onClick={convertStringToBytes}>
      #
    </div>
  );
};
export const UintToEtherConverter = ({ form, setForm, stateObjectKey }: IUtilityButton) => {
  const convertEtherToUint = useCallback(() => {
    if (!form[stateObjectKey]) {
      return;
    }
    setForm({
      ...form,
      [stateObjectKey]:
        form[stateObjectKey] instanceof BigNumber
          ? ethers.utils.formatEther(form[stateObjectKey])
          : ethers.utils.parseEther(form[stateObjectKey]),
    });
  }, [form, setForm, stateObjectKey]);

  return (
    <div className="cursor-pointer text-l font-semibold px-4 text-accent" onClick={convertEtherToUint}>
      ∗
    </div>
  );
};
