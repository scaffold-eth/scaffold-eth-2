import React, { ChangeEvent, useEffect, useState } from "react";
import { useAppStore } from "~~/services/store/store";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

type TEtherInputProps = {
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
export default function EtherInput({ value, name, placeholder, onChange }: TEtherInputProps) {
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

  const onChangeNumber = (event: ChangeEvent<HTMLInputElement>) => {
    let ethNewValue;
    const newValue = event.target.value;

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
    <>
      <div className="rounded-full border-2 border-base-300">
        <div className="form-control grow">
          <div className="flex w-full items-center">
            <span className="pl-4 text-primary">{usdMode ? "$" : "Ξ"}</span>
            <input
              name={name}
              type="text"
              placeholder={placeholder}
              className="input input-ghost pl-1 focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow"
              value={displayValue}
              onChange={onChangeNumber}
            />
            <button
              className="btn btn-primary h-[2.2rem] min-h-[2.2rem]"
              onClick={toggleMode}
              disabled={!usdMode && !ethPrice}
            >
              {usdMode ? "ETH" : "USD"}{" "}
              <ArrowsRightLeftIcon className="h-3 w-3 cursor-pointer ml-1" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
