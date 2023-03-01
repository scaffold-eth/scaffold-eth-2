import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { InputBase } from "./InputBase";
import { CommonInputProps, NUMBER_REGEX, UintVariant } from "./utils";

type UintInputProps = CommonInputProps<string | BigNumber> & {
  variant?: UintVariant;
};

export const UintInput = ({ value, onChange, name, placeholder, variant = UintVariant.UINT256 }: UintInputProps) => {
  const [inputError, setInputError] = useState(false);
  const convertEtherToUint = useCallback(() => {
    if (!value || value instanceof BigNumber) {
      return;
    }
    onChange(ethers.utils.parseEther(value));
  }, [onChange, value]);

  useEffect(() => {
    let valueAsBigNumber;
    try {
      valueAsBigNumber = BigNumber.from(value);
    } catch (e) {}
    if (!BigNumber.isBigNumber(valueAsBigNumber)) {
      return;
    }
    const hexString = valueAsBigNumber.toHexString();
    if (hexString.substring(2).length * 4 > Number(variant.substring(4))) {
      setInputError(true);
    } else {
      setInputError(false);
    }
  }, [value, setInputError, variant]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={value => {
        if (typeof value === "string" && !NUMBER_REGEX.test(value)) {
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
