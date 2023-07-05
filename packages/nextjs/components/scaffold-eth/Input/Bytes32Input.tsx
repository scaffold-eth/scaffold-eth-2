import { useCallback } from "react";
import { hexToString, isHex, stringToHex } from "viem";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const Bytes32Input = ({ value, onChange, name, placeholder }: CommonInputProps) => {
  const convertStringToBytes32 = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(isHex(value) ? hexToString(value, { size: 32 }) : stringToHex(value, { size: 32 }));
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
          onClick={convertStringToBytes32}
        >
          #
        </div>
      }
    />
  );
};
