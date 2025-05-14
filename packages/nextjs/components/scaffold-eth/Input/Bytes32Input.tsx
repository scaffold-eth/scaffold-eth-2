import { useCallback } from "react";
import { hexToString, isHex, stringToHex } from "viem";
import { Button } from "~~/components/Button";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const Bytes32Input = ({ value, onChange, name, placeholder, disabled }: CommonInputProps) => {
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
      disabled={disabled}
      suffix={
        <Button
          variant="secondary"
          size="sm"
          circle
          className="self-center cursor-pointer text-lg px-4 h-[2.2rem] min-h-[2.2rem]"
          onClick={convertStringToBytes32}
        >
          #
        </Button>
      }
    />
  );
};
