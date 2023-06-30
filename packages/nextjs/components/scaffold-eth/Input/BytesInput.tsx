import { useCallback } from "react";
import { ethers } from "ethers";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const BytesInput = ({ value, onChange, name, placeholder }: CommonInputProps) => {
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
          className="cursor-pointer self-center px-4 text-xl font-semibold text-accent"
          onClick={convertStringToBytes}
        >
          #
        </div>
      }
    />
  );
};
