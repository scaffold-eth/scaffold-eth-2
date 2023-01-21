import { Dispatch, SetStateAction } from "react";
import { toast } from "~~/utils/scaffold-eth";

const NUMBER_REGEX = /^\d+\.?\d*$/;

/**
 * Removes redundant leading and trailing zeros from stringified number
 * @param num stringified number
 */
const removeRedundantZeroes = (num: string) => {
  return (
    num
      // leading
      .replace(/^0+(0\.|[1-9]+)/, "$1")
      // trailing
      .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, "$1")
  );
};

/**
 * Multiplies stringified number to positive power of 10
 * @param num stringified number
 * @param powerOf10 positive power of 10
 * @returns {string} result of multiplying
 */
const multiplyStringifiedNumberToPowerOf10 = (num: string, powerOf10: number): string => {
  if (!num || !NUMBER_REGEX.test(num)) {
    return "";
  }
  const numberParts = num.split(".");
  let result = "";
  if (numberParts.length === 1) {
    result = `${num}${"0".repeat(powerOf10)}`;
  } else if (numberParts[1] && powerOf10 < numberParts[1].length) {
    result = `${numberParts[0]}${numberParts[1].slice(0, powerOf10)}.${numberParts[1].slice(powerOf10)}`;
  } else {
    result = `${numberParts[0]}${numberParts[1]}${"0".repeat(powerOf10 - numberParts[1].length)}`;
  }

  return removeRedundantZeroes(result);
};

/**
 * Input component which comes with utility buttons to handle conversion of ETH
 */
const TxValueInput = ({ setTxValue, txValue }: { setTxValue: Dispatch<SetStateAction<string>>; txValue: string }) => {
  return (
    <div className="flex items-end border-2 border-base-300 bg-base-200 rounded-full text-primary justify-between pr-3">
      <input
        placeholder="value (wei)"
        autoComplete="off"
        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
        value={txValue}
        onChange={e => {
          if (!e.target.value) {
            setTxValue("");
            return;
          }
          if (NUMBER_REGEX.test(e.target.value)) {
            setTxValue(e.target.value);
            return;
          }
          // @todo: change to the error message below the input?
          toast.error("Invalid number");
        }}
      />
      <div
        className="space-x-4 flex tooltip tooltip-top tooltip-secondary before:content-[attr(data-tip)]"
        data-tip="multiply by 10^18"
      >
        <button
          className="cursor-pointer text-xl font-semibold pt-1 text-accent"
          onClick={() => {
            const multiplied = multiplyStringifiedNumberToPowerOf10(txValue, 18);
            setTxValue(multiplied);
          }}
        >
          *
        </button>
      </div>
    </div>
  );
};

export { TxValueInput };
