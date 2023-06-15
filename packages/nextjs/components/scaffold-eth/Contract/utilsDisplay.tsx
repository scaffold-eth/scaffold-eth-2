import { ReactElement } from "react";
import { TransactionBase, TransactionReceipt } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

type DisplayContent =
  | string
  | number
  | bigint
  | Record<string, any>
  | TransactionBase
  | TransactionReceipt
  | undefined
  | unknown;

export const displayTxResult = (
  displayContent: DisplayContent | DisplayContent[],
  asText = false,
): string | ReactElement | number => {
  if (displayContent == null) {
    return "";
  }

  // TODO: Handle too big bigNumber to show ethers value -> https://github.com/scaffold-eth/scaffold-eth-2/commit/e5a591f820851f919632f3343d1f3f4548f07ac7#diff-5ca89ee1d9a40426f20c02e8b49a214feace564a3dc64907d5d4c5de90dcde03
  if (typeof displayContent === "bigint" || typeof displayContent === "number") {
    return displayContent.toString();
  }

  if (typeof displayContent === "string" && displayContent.indexOf("0x") === 0 && displayContent.length === 42) {
    return asText ? displayContent : <Address address={displayContent} />;
  }

  if (Array.isArray(displayContent)) {
    const mostReadable = (v: DisplayContent) =>
      ["number", "boolean"].includes(typeof v) ? v : displayTxResultAsText(v);
    const displayable = JSON.stringify(displayContent.map(mostReadable), replacer);

    return asText ? (
      displayable
    ) : (
      <span style={{ overflowWrap: "break-word", width: "100%" }}>{displayable.replaceAll(",", ",\n")}</span>
    );
  }

  return JSON.stringify(displayContent, replacer, 2);
};

const displayTxResultAsText = (displayContent: DisplayContent) => displayTxResult(displayContent, true);
