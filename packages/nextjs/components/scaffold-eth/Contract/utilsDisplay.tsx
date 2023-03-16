import { ReactElement } from "react";
import { TransactionResponse } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { BigNumber } from "ethers";
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
