import { Fetcher, Route, Token, WETH } from "@uniswap/sdk";
import { useProvider } from "wagmi";

export const useEthPrice = async (): Promise<number> => {
  let price: number;
  const provider = useProvider();

  console.log("provider", provider);

  if (provider !== undefined) {
    for (let i = 0; i < provider?.chains?.length; i++) {
      console.log("chain", provider?.chains[i]?.name);

      if (provider?.chains[i]?.name === "Ethereum") {
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
      }
    }
  }

  return 0;
};
