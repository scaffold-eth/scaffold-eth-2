import { Fetcher, Route, Token, WETH } from "@uniswap/sdk";

export const useEthPrice = async (provider: any): Promise<number> => {
  let price: number;
  // get the uni price
  try {
    const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider);
    const route = new Route([pair], WETH[DAI.chainId]);
    price = parseFloat(route.midPrice.toSignificant(6));

    return price;
  } catch (error) {
    console.log("error", error);
  }

  return 0;
};
