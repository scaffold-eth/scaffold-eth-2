import "../styles/globals.css";

import type { AppProps } from "next/app";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createClient, WagmiConfig } from "wagmi";

import "@rainbow-me/rainbowkit/styles.css";
import { appChains, wagmiConnectors } from "~~/web3/wagmiConnectors";

const wagmiClient = createClient({
  autoConnect: true,
  connectors: wagmiConnectors,
  provider: appChains.provider,
  webSocketProvider: appChains.webSocketProvider,
});

function ScaffoldEthApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={appChains.chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default ScaffoldEthApp;
