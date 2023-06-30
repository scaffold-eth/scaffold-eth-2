import { ChangeEvent, ReactNode, useCallback } from "react";
import { CommonInputProps } from "~~/components/scaffold-eth";

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
  let modifier = "";
  if (error) {
    modifier = "border-error";
  } else if (disabled) {
    modifier = "border-disabled bg-base-300";
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange],
  );

  return (
    <div className={`flex rounded-full border-2 border-base-300 bg-base-200 text-accent ${modifier}`}>
      {prefix}
      <input
        className="input input-ghost h-[2.2rem] min-h-[2.2rem] w-full border px-4 font-medium text-gray-400 placeholder:text-accent/50 focus:bg-transparent focus:text-gray-400 focus:outline-none"
        placeholder={placeholder}
        name={name}
        value={value?.toString()}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
      />
      {suffix}
    </div>
  );
};
