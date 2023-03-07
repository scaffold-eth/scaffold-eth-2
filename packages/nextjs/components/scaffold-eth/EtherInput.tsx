import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAppStore } from "~~/services/store/store";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

function etherValueToDisplayValue(usdMode: boolean, etherValue: string, ethPrice: number) {
  if (usdMode && ethPrice) {
    const parsedEthValue = parseFloat(etherValue);
    if (Number.isNaN(parsedEthValue)) {
      return etherValue;
    } else {
      return (parsedEthValue * ethPrice).toFixed(2);
    }
  } else {
    return etherValue;
  }
}

function displayValueToEtherValue(usdMode: boolean, displayValue: string, ethPrice: number) {
  if (usdMode && ethPrice) {
    const parsedDisplayValue = parseFloat(displayValue);
    if (Number.isNaN(parsedDisplayValue)) {
      // Invalid number.
      return displayValue;
    } else {
      // Compute the ETH value if a valid number.
      return (parsedDisplayValue / ethPrice).toString();
    }
  } else {
    return displayValue;
  }
}

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
export default function EtherInput({ value = "", name, placeholder, onChange }: EtherInputProps) {
  const internalEthValue = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [usdMode, setUSDMode] = useState(false);

  const ethPrice = useAppStore(state => state.ethPrice);

  useEffect(() => {
    // This useEffect makes it possible to use EtherInput as a controlled input by updating the internal displayValue when the value prop changes
    // Only update the internal value and display value if it is differnt (i.e. it was changed outside this component)
    if (value !== internalEthValue.current) {
      internalEthValue.current = value;
      setDisplayValue(etherValueToDisplayValue(usdMode, value, ethPrice));
    }
  }, [value, usdMode, ethPrice]);

  const handleChangeNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setDisplayValue(newValue);

    const newEthValue = displayValueToEtherValue(usdMode, newValue, ethPrice);
    internalEthValue.current = newEthValue;
    if (onChange) {
      onChange(newEthValue);
    }
  };

  const toggleMode = () => {
    const newUsdMode = !usdMode;
    setDisplayValue(etherValueToDisplayValue(newUsdMode, internalEthValue.current, ethPrice));
    setUSDMode(newUsdMode);
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
              onChange={handleChangeNumber}
            />
            <button
              className="btn btn-primary h-[2.2rem] min-h-[2.2rem]"
              onClick={toggleMode}
              disabled={!usdMode && !ethPrice}
            >
              <ArrowsRightLeftIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
