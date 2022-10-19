import { Fetcher, Pair, Route, Token, WETH } from "@uniswap/sdk";

export const useEthPrice = async (provider: any): Promise<number> => {
  // Get the price of ETH based on ETH/DAI trading pair from Uniswap SDK
  try {
    const DAI: Token = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
    const pair: Pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider);
    const route: Route = new Route([pair], WETH[DAI.chainId]);
    const price: number = parseFloat(route.midPrice.toSignificant(6));

    return price;
  } catch (error) {
    console.log("error", error);
  }

  return 0;
};
