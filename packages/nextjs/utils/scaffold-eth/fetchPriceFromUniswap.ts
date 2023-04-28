import { Fetcher, Route, Token } from "@uniswap/sdk";
import { Provider } from "@wagmi/core";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

export const fetchPriceFromUniswap = async (provider: Provider): Promise<number> => {
  const configuredNetwork = getTargetNetwork();
  if (configuredNetwork.nativeCurrency.symbol !== "ETH" && !configuredNetwork.nativeCurrencyTokenAddress) {
    return 0;
  }
  try {
    const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
    const TOKEN = await Fetcher.fetchTokenData(
      1,
      configuredNetwork.nativeCurrencyTokenAddress || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      provider,
    );
    const pair = await Fetcher.fetchPairData(DAI, TOKEN, provider);
    const route = new Route([pair], TOKEN);
    const price = parseFloat(route.midPrice.toSignificant(6));
    return price;
  } catch (error) {
    console.error("useNativeCurrencyPrice - Error fetching ETH price from Uniswap: ", error);
    return 0;
  }
};
