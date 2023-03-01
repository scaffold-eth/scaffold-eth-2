import { ChangeEvent, ReactNode, useCallback } from "react";
import { CommonInputProps } from "./utils";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  disabled?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const InputBase = <T extends { toString: () => string } = string>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
}: InputBaseProps<T>) => {
  const modifiers = [];
  if (error) {
    modifiers.push("border-error");
  } else if (disabled) {
    modifiers.push("border-disabled bg-base-300");
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange],
  );

  return (
    <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent ${modifiers.join(" ")}`}>
      {prefix}
      <input
        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
        placeholder={placeholder}
        name={name}
        value={value.toString()}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
      />
      {suffix}
    </div>
  );
};
