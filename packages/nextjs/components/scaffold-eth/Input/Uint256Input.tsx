import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { InputBase } from "../Input/InputBase";

const NUMBER_REGEX = /^\.?\d+\.?\d*$/;

type Uint256InputProps = {
  value?: string | BigNumber;
  onChange: (newValue: string | BigNumber) => void;
  name?: string;
  placeholder?: string;
};

export const Uint256Input = ({ value, onChange, name, placeholder }: Uint256InputProps) => {
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
    if (hexString.substring(2).length * 4 > 256) {
      setInputError(true);
    } else {
      setInputError(false);
    }
  }, [value, setInputError]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={value => {
        if (value && !NUMBER_REGEX.test(value)) {
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
            className="self-center cursor-pointer text-l font-semibold px-4 text-accent"
            onClick={convertEtherToUint}
          >
            ∗
          </div>
        )
      }
    />
  );
};
