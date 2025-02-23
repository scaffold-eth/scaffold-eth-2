import { ReactNode } from "react";
import { useInputBase } from "../../../AddressInput2/_components/InputBase2/_hooks/useInputBase";
import { CommonInputProps } from "~~/components/scaffold-eth";
import { Input } from "~~/components/ui/input";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  reFocus?: boolean;
};

export const CustomInputBase = <T extends { toString: () => string } | undefined = string>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
  reFocus,
}: InputBaseProps<T>) => {
  const { handleChange, onFocus, inputRef } = useInputBase<T>({ onChange, reFocus });

  let modifier = "border-blue-400";
  if (error) {
    modifier = "border-error";
  } else if (disabled) {
    modifier = "border-disabled bg-base-300";
  }

  return (
    <div className={`flex border-2  bg-base-200 rounded-md ${modifier}`}>
      {prefix}
      <Input
        className={`input input-ghost focus-within:border-transparent px-4 border w-full font-medium focus:!outline-none focus:!ring-0`}
        placeholder={placeholder}
        name={name}
        value={value?.toString()}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
        ref={inputRef}
        onFocus={onFocus}
      />
      {suffix}
    </div>
  );
};
