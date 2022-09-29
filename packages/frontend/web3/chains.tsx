import { chain, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

export const wagmiChains = configureChains(
  [
    chain.mainnet,
    chain.polygon,
    chain.optimism,
    chain.arbitrum,
    chain.hardhat,
    chain.localhost,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [chain.goerli, chain.kovan, chain.rinkeby, chain.ropsten]
      : []),
  ],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
    }),
    publicProvider(),
  ],
);
