import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { InputBase } from "./InputBase";
import { CommonInputProps, UNSIGNED_NUMBER_REGEX, UintVariant, isValid } from "./utils";

type UintInputProps = CommonInputProps<string | BigNumber> & {
  variant?: UintVariant;
};

export const UintInput = ({ value, onChange, name, placeholder, variant = UintVariant.UINT256 }: UintInputProps) => {
  const [inputError, setInputError] = useState(false);
  const convertEtherToUint = useCallback(() => {
    if (!value) {
      return;
    }
    const newValue = ethers.utils.parseEther(value.toString());
    onChange(newValue);
  }, [onChange, value]);

  useEffect(() => {
    if ((value && typeof value === "string" && !UNSIGNED_NUMBER_REGEX.test(value)) || !isValid(variant, value)) {
      setInputError(true);
    } else {
      setInputError(false);
    }
  }, [value, variant]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={onChange}
      suffix={
        !inputError && (
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
