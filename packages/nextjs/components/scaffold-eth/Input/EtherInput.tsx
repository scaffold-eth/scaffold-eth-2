import React, { useEffect, useState } from "react";
import { useAppStore } from "~~/services/store/store";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { InputBase } from "./InputBase";

type EtherInputProps = {
  onChange?: (arg: string) => void;
  placeholder?: string;
  name?: string;
  value?: string;
};

/**
 * Input for ETH amount with USD conversion.
 *
 * onChange will always be called with the value in ETH
 */
export function EtherInput({ value, name, placeholder, onChange }: EtherInputProps) {
  const [ethValue, setEthValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [usdMode, setUSDMode] = useState(false);

  const ethPrice = useAppStore(state => state.ethPrice);

  // Controlled vs Uncontrolled input.
  const currentValue = value !== undefined ? value : ethValue;

  useEffect(() => {
    // Reset when clearing controlled input
    if (!currentValue) {
      setDisplayValue("");
      setEthValue("");
    }
  }, [currentValue]);

  const onChangeNumber = (newValue: string) => {
    let ethNewValue;

    if (usdMode) {
      const parsedNewValue = parseFloat(newValue);
      if (Number.isNaN(parsedNewValue)) {
        // Invalid number.
        ethNewValue = newValue;
      } else {
        // Compute the ETH value if a valid number.
        ethNewValue = (parsedNewValue / ethPrice).toString();
      }
    } else {
      ethNewValue = newValue;
    }

    setEthValue(ethNewValue);
    setDisplayValue(newValue);
    if (onChange) {
      onChange(ethNewValue);
    }
  };

  const toggleMode = async () => {
    if (usdMode) {
      // Toggling to ETH mode
      const parsedCurrentDisplayValue = parseFloat(displayValue);
      if (Number.isNaN(parsedCurrentDisplayValue)) {
        setDisplayValue(displayValue);
      } else {
        const ethValueConversion = (parsedCurrentDisplayValue / ethPrice).toString();
        setDisplayValue(ethValueConversion);
        setEthValue(ethValueConversion);
      }
    } else {
      // Toggling to USD mode
      const parsedCurrentEthValue = parseFloat(currentValue);

      if (Number.isNaN(parsedCurrentEthValue)) {
        setDisplayValue(currentValue);
      } else {
        setDisplayValue((parseFloat(currentValue) * ethPrice).toFixed(2).toString());
      }
    }
    setUSDMode(!usdMode);
  };

  return (
    <InputBase
      name={name}
      value={displayValue}
      placeholder={placeholder}
      onChange={onChangeNumber}
      prefix={<span className="pl-4 -mr-2 text-primary self-center">{usdMode ? "$" : "Ξ"}</span>}
      suffix={
        <button
          className="btn btn-primary h-[2.2rem] min-h-[2.2rem]"
          onClick={toggleMode}
          disabled={!usdMode && !ethPrice}
        >
          <ArrowsRightLeftIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
        </button>
      }
    />
  );
}
