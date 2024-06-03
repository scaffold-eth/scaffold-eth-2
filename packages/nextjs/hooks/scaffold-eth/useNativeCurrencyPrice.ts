import { useCallback, useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useInterval } from "usehooks-ts";
import scaffoldConfig from "~~/scaffold.config";
import { fetchPriceFromUniswap } from "~~/utils/scaffold-eth";

const enablePolling = false;

/**
 * Get the price of Native Currency based on Native Token/DAI trading pair from Uniswap SDK
 */
export const useNativeCurrencyPrice = () => {
  const { targetNetwork } = useTargetNetwork();
  const [isFetching, setIsFetching] = useState(true);
  const [nativeCurrencyPrice, setNativeCurrencyPrice] = useState(0);

  const fetchPrice = useCallback(async () => {
    setIsFetching(true);
    const price = await fetchPriceFromUniswap(targetNetwork);
    setNativeCurrencyPrice(price);
    setIsFetching(false);
  }, [targetNetwork]);

  // Get the price of ETH from Uniswap on mount
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Get the price of ETH from Uniswap at a given interval
  useInterval(fetchPrice, enablePolling ? scaffoldConfig.pollingInterval : null);

  return { nativeCurrencyPrice, isFetching };
};
