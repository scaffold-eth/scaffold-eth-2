import { ReactNode } from "react";
import { useInputBase } from "./_hooks/useInputBase";
import { CommonInputProps } from "~~/components/scaffold-eth";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  reFocus?: boolean;
};

export const InputBase2 = <T extends { toString: () => string } | undefined = string>({
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

  let modifier = "";
  if (error) {
    modifier = "border-error";
  } else if (disabled) {
    modifier = "border-disabled bg-base-300";
  }

  return (
    <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent ${modifier}`}>
      {prefix}
      <input
        className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/70 text-base-content/70 focus:text-base-content/70"
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
