import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { InputBase } from "./InputBase";
import { CommonInputProps, IntegerVariant, isValidInteger } from "./utils";

type IntegerInputProps = CommonInputProps<string | BigNumber> & {
  variant?: IntegerVariant;
};

export const IntegerInput = ({
  value,
  onChange,
  name,
  placeholder,
  variant = IntegerVariant.UINT256,
}: IntegerInputProps) => {
  const [inputError, setInputError] = useState(false);
  const multiplyBy1e18 = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(ethers.utils.parseEther(value.toString()));
  }, [onChange, value]);

  useEffect(() => {
    if (isValidInteger(variant, value, false)) {
      setInputError(false);
    } else {
      setInputError(true);
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
            <button className="cursor-pointer font-semibold px-4 text-accent" onClick={multiplyBy1e18}>
              ∗
            </button>
          </div>
        )
      }
    />
  );
};
