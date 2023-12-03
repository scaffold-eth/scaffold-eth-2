import { useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useInterval } from "usehooks-ts";
import scaffoldConfig from "~~/scaffold.config";
import { fetchPriceFromUniswap } from "~~/utils/scaffold-eth";

const enablePolling = false;

/**
 * Get the price of Native Currency based on Native Token/DAI trading pair from Uniswap SDK
 * @returns nativeCurrencyPrice: number
 */
export const useNativeCurrencyPrice = () => {
  const { targetNetwork } = useTargetNetwork();
  const [nativeCurrencyPrice, setNativeCurrencyPrice] = useState(0);

  // Get the price of ETH from Uniswap on mount
  useEffect(() => {
    (async () => {
      const price = await fetchPriceFromUniswap(targetNetwork);
      setNativeCurrencyPrice(price);
    })();
  }, [targetNetwork]);

  // Get the price of ETH from Uniswap at a given interval
  useInterval(
    async () => {
      const price = await fetchPriceFromUniswap(targetNetwork);
      setNativeCurrencyPrice(price);
    },
    enablePolling ? scaffoldConfig.pollingInterval : null,
  );

  return nativeCurrencyPrice;
};
