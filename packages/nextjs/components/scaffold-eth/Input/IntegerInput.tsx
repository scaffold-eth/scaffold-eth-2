import { useCallback, useEffect, useState } from "react";
import { CommonInputProps, InputBase, IntegerVariant, isValidInteger } from "~~/components/scaffold-eth";

type IntegerInputProps = CommonInputProps<string | bigint> & {
  variant?: IntegerVariant;
};

export const IntegerInput = ({
  value,
  onChange,
  name,
  placeholder,
  variant = IntegerVariant.UINT256,
}: IntegerInputProps) => {
  const [inputError, setInputError] = useState(false);
  const multiplyBy1e18 = useCallback(() => {
    if (!value) {
      return;
    }
    if (typeof value === "bigint") {
      return onChange(value * 10n ** 18n);
    }
    return onChange(BigInt(Math.round(Number(value) * 10 ** 18)));
  }, [onChange, value]);

  useEffect(() => {
    if (isValidInteger(variant, value, false)) {
      setInputError(false);
    } else {
      setInputError(true);
    }
  }, [value, variant]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={onChange}
      suffix={
        !inputError && (
          <div
            className="tooltip-top tooltip tooltip-secondary flex space-x-4 before:right-[-10px] before:left-auto before:transform-none before:content-[attr(data-tip)]"
            data-tip="Multiply by 10^18 (wei)"
          >
            <button className="cursor-pointer px-4 font-semibold text-accent" onClick={multiplyBy1e18}>
              ∗
            </button>
          </div>
        )
      }
    />
  );
};
