import React, { ChangeEvent, useMemo, useState } from "react";
import { useAppStore } from "~~/services/store/store";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { NUMBER_REGEX } from "./Contract/utilsComponents";

const MAX_DECIMALS_USD = 2;

function etherValueToDisplayValue(usdMode: boolean, etherValue: string, ethPrice: number) {
  if (usdMode && ethPrice) {
    const parsedEthValue = parseFloat(etherValue);
    if (Number.isNaN(parsedEthValue)) {
      return etherValue;
    } else {
      // We need to round the value rather than use toFixed,
      // since otherwise a user would not be able to modify the decimal value
      return (Math.round(parsedEthValue * ethPrice * 10 ** MAX_DECIMALS_USD) / 10 ** MAX_DECIMALS_USD).toString();
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
  onChange: (arg: string) => void;
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
  const [transitoryDisplayValue, setTransitoryDisplayValue] = useState<string>();
  const ethPrice = useAppStore(state => state.ethPrice);
  const [usdMode, setUSDMode] = useState(false);

  // The displayValue is derived from the ether value that is controlled outside of the component
  // In usdMode, it is converted to its usd value, in regular mode it is unaltered
  const displayValue = useMemo(() => {
    const newDisplayValue = etherValueToDisplayValue(usdMode, value, ethPrice);
    if (transitoryDisplayValue && parseFloat(newDisplayValue) === parseFloat(transitoryDisplayValue)) {
      return transitoryDisplayValue;
    }
    // Clear any transitory display values that might be set
    setTransitoryDisplayValue(undefined);
    return newDisplayValue;
  }, [ethPrice, transitoryDisplayValue, usdMode, value]);

  const handleChangeNumber = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    if (newValue && !NUMBER_REGEX.test(newValue)) {
      return;
    }

    // Following condition is a fix to prevent usdMode from experiencing different display values
    // than what the user entered. This can happen due to floating point rounding errors that are introduced in the back and forth conversion
    if (usdMode) {
      const decimals = newValue.split(".")[1];
      if (decimals && decimals.length > MAX_DECIMALS_USD) {
        return;
      }
    }

    // Since the display value is a derived state (calculated from the ether value), usdMode would not allow introducing a decimal point.
    // This condition handles a transitory state for a display value with a trailing decimal sign
    if (newValue.endsWith(".") || newValue.endsWith(".0")) {
      setTransitoryDisplayValue(newValue);
    } else {
      setTransitoryDisplayValue(undefined);
    }

    const newEthValue = displayValueToEtherValue(usdMode, newValue, ethPrice);
    onChange(newEthValue);
  };

  const toggleMode = () => {
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
