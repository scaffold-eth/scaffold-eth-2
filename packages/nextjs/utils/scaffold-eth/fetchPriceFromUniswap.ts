import { Fetcher, Route, Token, WETH } from "@uniswap/sdk";
import { Provider } from "@wagmi/core";

export default async function fetchPriceFromUniswap(provider: Provider) {
  try {
    const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider);
    const route = new Route([pair], WETH[DAI.chainId]);
    const price = parseFloat(route.midPrice.toSignificant(6));
    return price;
  } catch (error) {
    console.log("useEthPrice - Error fetching ETH price from Uniswap: ", error);
  }
}
