import { useCallback } from "react";
import { bytesToString, isHex, toBytes, toHex } from "viem";
import { Button } from "~~/components/Button";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const BytesInput = ({ value, onChange, name, placeholder, disabled }: CommonInputProps) => {
  const convertStringToBytes = useCallback(() => {
    onChange(isHex(value) ? bytesToString(toBytes(value)) : toHex(toBytes(value)));
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
          onClick={convertStringToBytes}
        >
          #
        </Button>
      }
    />
  );
};
