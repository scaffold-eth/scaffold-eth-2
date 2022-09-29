import "../styles/globals.css";

import type { AppProps } from "next/app";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createClient, WagmiConfig } from "wagmi";

import "@rainbow-me/rainbowkit/styles.css";
import { wagmiChains } from "~~/web3/chains";
import { wagmiConnectors } from "~~/web3/walletConnectors";

const wagmiClient = createClient({
  autoConnect: true,
  connectors: wagmiConnectors,
  provider: wagmiChains.provider,
  webSocketProvider: wagmiChains.webSocketProvider,
});

function ScaffoldEthApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={wagmiChains.chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default ScaffoldEthApp;
