import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import { useProvider } from "wagmi";
import fetchPriceFromUniswap from "~~/utils/scaffold-eth/fetchPriceFromUniswap";

/**
 * Get the price of ETH based on ETH/DAI trading pair from Uniswap SDK
 * @returns ethPrice: number
 */

export const useEthPrice = () => {
  const provider = useProvider({ chainId: 1 });
  const [ethPrice, setEthPrice] = useState(0);

  //Get the price of ETH from Uniswap on mount
  useEffect(() => {
    fetchPriceFromUniswap(provider).then(price => {
      setEthPrice(price || 0);
    });
  }, [provider]);

  //Get the price of ETH from Uniswap at a given interval
  useInterval(
    () => {
      fetchPriceFromUniswap(provider).then(price => {
        setEthPrice(price || 0);
      });
    },
    process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL ? parseInt(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL) : 30_000,
  );

  return ethPrice;
};
