import { ReactElement, useState } from "react";
import { TransactionBase, TransactionReceipt, formatEther, isAddress, isHex } from "viem";
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

export const displayTxResult = (displayContent: DisplayContent | DisplayContent[]): string | ReactElement | number => {
  if (displayContent == null) {
    return "";
  }

  if (typeof displayContent === "bigint") {
    return <NumberDisplay value={displayContent} />;
  }

  if (typeof displayContent === "string") {
    if (isAddress(displayContent)) {
      return <Address address={displayContent} />;
    }

    if (isHex(displayContent)) {
      return displayContent; // don't add quotes
    }
  }

  if (Array.isArray(displayContent)) {
    return <TupleDisplay value={displayContent} />;
  }

  if (typeof displayContent === "object") {
    return <StructDisplay value={displayContent} />;
  }

  return JSON.stringify(displayContent, replacer, 2);
};

const NumberDisplay = ({ value }: { value: bigint }) => {
  const [isEther, setIsEther] = useState(false);

  const asNumber = Number(value);
  if (asNumber <= Number.MAX_SAFE_INTEGER && asNumber >= Number.MIN_SAFE_INTEGER) {
    return String(value);
  }

  return (
    <span>
      {isEther ? "Ξ" + formatEther(value) : String(value)}
      <button
        className="btn btn-primary btn-square btn-xs tooltip tooltip-secondary font-sans ml-2"
        data-tip={isEther ? "Format as number" : "Format as ether"}
        onClick={() => setIsEther(!isEther)}
      >
        /
      </button>
    </span>
  );
};

const TupleDisplay = ({ value }: { value: DisplayContent[] }) => {
  return (
    <div className="flex flex-col">
      tuple
      {value.map((v, i) => (
        <div key={i} className="flex flex-row ml-4">
          <span className="text-gray-500 dark:text-gray-400 mr-2">[{i}]:</span>
          <span className="text-base-content">{displayTxResult(v)}</span>
        </div>
      ))}
    </div>
  );
};

const StructDisplay = ({ value }: { value: Record<string, any> }) => {
  return (
    <div className="flex flex-col">
      struct
      {Object.entries(value).map(([k, v]) => (
        <div key={k} className="flex flex-row ml-4">
          <span className="text-gray-500 dark:text-gray-400 mr-2">{k}:</span>
          <span className="text-base-content">{displayTxResult(v)}</span>
        </div>
      ))}
    </div>
  );
};
