import { Dispatch, SetStateAction, useState } from "react";

export const NUMBER_REGEX = /^\.?\d+\.?\d*$/;

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
 * @param numberValue stringified number
 * @param powerOf10 positive power of 10
 * @returns {string} result of multiplying
 */
const multiplyStringifiedNumberToPowerOf10 = (numberValue: string, powerOf10: number): string => {
  if (!numberValue || !NUMBER_REGEX.test(numberValue)) {
    return "";
  }

  const numberParts = numberValue.split(".");
  let result = "";
  if (numberParts.length === 1) {
    // numberValue is an integer number or a decimal number starting with "." (no leading 0)
    result = `${numberValue}${"0".repeat(powerOf10)}`;
  } else if (numberParts[1] && powerOf10 < numberParts[1].length) {
    // numberValue is a decimal number AND the result is also a decimal.
    result = `${numberParts[0]}${numberParts[1].slice(0, powerOf10)}.${numberParts[1].slice(powerOf10)}`;
  } else {
    // numberValue is a decimal number AND the result is an integer.
    result = `${numberParts[0]}${numberParts[1]}${"0".repeat(powerOf10 - numberParts[1].length)}`;
  }

  return removeRedundantZeroes(result);
};

/**
 * Input TX value component with wei conversion util.
 */
const TxValueInput = ({ setTxValue, txValue }: { setTxValue: Dispatch<SetStateAction<string>>; txValue: string }) => {
  const [inputError, setInputError] = useState(false);

  return (
    <div
      className={`flex items-center border-2 bg-base-200 rounded-full text-primary justify-between ${
        inputError ? "border-error" : "border-base-300"
      }`}
    >
      <input
        placeholder="value (wei)"
        autoComplete="off"
        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
        value={txValue}
        onChange={e => {
          if (!e.target.value) {
            setInputError(false);
            setTxValue("");
            return;
          }

          setTxValue(e.target.value);

          if (!NUMBER_REGEX.test(e.target.value)) {
            setInputError(true);
            return;
          }

          setInputError(false);
        }}
      />
      {!inputError && (
        <div
          className="space-x-4 flex tooltip tooltip-top tooltip-secondary before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
          data-tip="Multiply by 10^18 (wei)"
        >
          <button
            className="cursor-pointer text-xl font-semibold px-4 text-accent"
            disabled={inputError}
            onClick={() => {
              const multiplied = multiplyStringifiedNumberToPowerOf10(txValue, 18);
              setTxValue(multiplied);
            }}
          >
            ∗
          </button>
        </div>
      )}
    </div>
  );
};

export { TxValueInput };
