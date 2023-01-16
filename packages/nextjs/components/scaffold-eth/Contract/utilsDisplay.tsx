import { TransactionResponse } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { BigNumber, ethers } from "ethers";
import React, { Dispatch, ReactElement, SetStateAction, useCallback } from "react";
import { Address } from "~~/components/scaffold-eth";

type displayContentType = string | number | BigNumber | Record<string, any> | TransactionResponse | undefined;

export const tryToDisplay = (
  displayContent: displayContentType | displayContentType[],
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
  } else if (typeof displayContent === "string" && displayContent.indexOf("0x") === 0 && displayContent.length === 42) {
    return asText ? displayContent : <Address address={displayContent} />;
  } else if (displayContent && Array.isArray(displayContent)) {
    const mostReadable = (v: displayContentType) =>
      ["number", "boolean"].includes(typeof v) ? v : tryToDisplayAsText(v);
    const displayable = JSON.stringify(displayContent.map(mostReadable));
    return asText ? (
      displayable
    ) : (
      <span style={{ overflowWrap: "break-word", width: "100%" }}>{displayable.replaceAll(",", ",\n")}</span>
    );
  }
  return JSON.stringify(displayContent, null, 2);
};

const tryToDisplayAsText = (displayContent: displayContentType) => tryToDisplay(displayContent, true);

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
    <div className="cursor-pointer text-xl font-semibold mr-3 text-accent" onClick={convertStringToBytes32}>
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
    <div className="cursor-pointer text-xl font-semibold mr-3 text-accent" onClick={convertStringToBytes}>
      #
    </div>
  );
};
export const UintToEtherConverter = ({ form, setForm, stateObjectKey }: IUtilityButton) => {
  const convertEtherToUint = useCallback(() => {
    setForm({ ...form, [stateObjectKey]: ethers.utils.parseEther(form[stateObjectKey]) });
  }, [form, setForm, stateObjectKey]);

  return (
    <div className="cursor-pointer text-xl font-semibold mr-3 text-accent" onClick={convertEtherToUint}>
      *
    </div>
  );
};
