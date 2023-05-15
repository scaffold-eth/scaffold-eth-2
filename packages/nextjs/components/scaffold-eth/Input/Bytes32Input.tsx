import { useCallback } from "react";
import { ethers } from "ethers";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const Bytes32Input = ({ value, onChange, name, placeholder }: CommonInputProps) => {
  const convertStringToBytes32 = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(
      ethers.utils.isHexString(value)
        ? ethers.utils.parseBytes32String(value)
        : ethers.utils.formatBytes32String(value),
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
          onClick={convertStringToBytes32}
        >
          #
        </div>
      }
    />
  );
};
