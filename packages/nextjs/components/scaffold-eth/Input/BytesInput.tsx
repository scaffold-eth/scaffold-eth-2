import { ethers } from "ethers";
import { useCallback } from "react";
import { InputBase } from "../Input/InputBase";

type BytesInputProps = {
  value: string;
  onChange: (newValue: string) => void;
  name?: string;
  placeholder?: string;
};

export const BytesInput = ({ value, onChange, name, placeholder }: BytesInputProps) => {
  const convertStringToBytes = useCallback(() => {
    onChange(
      ethers.utils.isHexString(value)
        ? ethers.utils.toUtf8String(value)
        : ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value)),
    );
  }, [onChange, value]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      suffix={
        <div
          className="self-center cursor-pointer text-xl font-semibold px-4 text-accent"
          onClick={convertStringToBytes}
        >
          #
        </div>
      }
    />
  );
};
