import { useCallback, useEffect, useState } from "react";
import { useGlobalState } from "~~/services/store/store";

export const useDisplayUsdMode = ({ defaultUsdMode = false }: { defaultUsdMode?: boolean }) => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const isPriceFetched = nativeCurrencyPrice > 0;
  const predefinedUsdMode = isPriceFetched ? Boolean(defaultUsdMode) : false;
  const [displayUsdMode, setDisplayUsdMode] = useState(predefinedUsdMode);

  useEffect(() => {
    setDisplayUsdMode(predefinedUsdMode);
  }, [predefinedUsdMode]);

  const toggleDisplayUsdMode = useCallback(() => {
    if (isPriceFetched) {
      setDisplayUsdMode(!displayUsdMode);
    }
  }, [displayUsdMode, isPriceFetched]);

  return { displayUsdMode, toggleDisplayUsdMode };
};
