import { useCallback, useEffect, useState } from "react";
import { parseEther } from "viem";
import { Tooltip } from "~~/app/components/Tooltip";
import { Button } from "~~/components/Button";
import { CommonInputProps, InputBase, IntegerVariant, isValidInteger } from "~~/components/scaffold-eth";

type IntegerInputProps = CommonInputProps<string> & {
  variant?: IntegerVariant;
  disableMultiplyBy1e18?: boolean;
};

export const IntegerInput = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
  variant = IntegerVariant.UINT256,
  disableMultiplyBy1e18 = false,
}: IntegerInputProps) => {
  const [inputError, setInputError] = useState(false);
  const multiplyBy1e18 = useCallback(() => {
    if (!value) {
      return;
    }
    return onChange(parseEther(value).toString());
  }, [onChange, value]);

  useEffect(() => {
    if (isValidInteger(variant, value)) {
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
      disabled={disabled}
      suffix={
        !inputError &&
        !disableMultiplyBy1e18 && (
          <Tooltip content="Multiply by 1e18 (wei)">
            <Button
              variant="secondary"
              size="sm"
              circle
              className="font-semibold text-accent h-[2.2rem] min-h-[2.2rem]"
              onClick={multiplyBy1e18}
              disabled={disabled}
              type="button"
            >
              ∗
            </Button>
          </Tooltip>
        )
      }
    />
  );
};
