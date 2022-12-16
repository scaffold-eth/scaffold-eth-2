import { Fetcher, Route, Token, WETH } from "@uniswap/sdk";
import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { useInterval } from "usehooks-ts";

/**
 * Get the price of ETH based on ETH/DAI trading pair from Uniswap SDK
 * @returns ethPrice: number
 */
export const useEthPrice = () => {
  const provider = useProvider({ chainId: 1 });
  const [ethPrice, setEthPrice] = useState(0);

  useEffect(() => {
    const fetchPriceFromUniswap = async () => {
      try {
        const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
        const pair = await Fetcher.fetchPairData(DAI, WETH[1], provider);
        const route = new Route([pair], WETH[1]);
        const price = parseFloat(route.midPrice.toSignificant(6));
        setEthPrice(price);
      } catch (error) {
        console.log("useEthPrice - Error fetching ETH price from Uniswap: ", error);
      }
    };

    fetchPriceFromUniswap();
  }, [provider]);

  useInterval(
    () => {
      const fetchPriceFromUniswap = async () => {
        try {
          const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
          const pair = await Fetcher.fetchPairData(DAI, WETH[1], provider);
          const route = new Route([pair], WETH[1]);
          const price = parseFloat(route.midPrice.toSignificant(6));
          setEthPrice(price);
        } catch (error) {
          console.log("useEthPrice - Error fetching ETH price from Uniswap: ", error);
        }
      };

      fetchPriceFromUniswap();
    },
    process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL ? parseInt(process.env.NEXT_PUBLIC_RPC_POLLING_INTERVAL) : 30_000,
  );

  return ethPrice;
};
