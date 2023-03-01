import { BigNumber, ethers } from "ethers";
import { useCallback, useState } from "react";
import { InputBase } from "./InputBase";
import { CommonInputProps, IntVariant, isValid, SIGNED_NUMBER_REGEX } from "./utils";

type IntInputProps = CommonInputProps<string | BigNumber> & {
  variant?: IntVariant;
};

export const IntInput = ({ value, onChange, name, placeholder, variant = IntVariant.INT256 }: IntInputProps) => {
  const [inputError, setInputError] = useState(false);
  const convertEtherToUint = useCallback(() => {
    if (!value || value instanceof BigNumber) {
      return;
    }
    onChange(ethers.utils.parseEther(value));
  }, [onChange, value]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={value => {
        if (
          (value && typeof value === "string" && !SIGNED_NUMBER_REGEX.test(value) && value !== "-") ||
          !isValid(variant, value)
        ) {
          setInputError(true);
        } else {
          setInputError(false);
        }
        onChange(value);
      }}
      suffix={
        !inputError &&
        !(value instanceof BigNumber) && (
          <div
            className="space-x-4 flex tooltip tooltip-top tooltip-secondary before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            data-tip="Multiply the value you entered by 10^18"
          >
            <button className="cursor-pointer font-semibold px-4 text-accent" onClick={convertEtherToUint}>
              ∗
            </button>
          </div>
        )
      }
    />
  );
};
