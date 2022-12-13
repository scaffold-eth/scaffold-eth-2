import React from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useAppStore } from "~~/services/store/store";

/**
 * Site footer
 */
export default function Footer() {
  const ethPrice = useAppStore(state => state.ethPriceSlice.ethPrice);

  return (
    <div className="bg-secondary p-4 flex-shrink-0">
      {ethPrice > 0 && (
        <div className="btn btn-primary btn-sm font-normal cursor-auto">
          <CurrencyDollarIcon className="text-black h-4 w-4 mr-0.5" />
          <span>{ethPrice}</span>
        </div>
      )}
    </div>
  );
}
