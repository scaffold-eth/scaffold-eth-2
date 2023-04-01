import "~~/styles/globals.css";

import type { AppProps } from "next/app";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { Toaster } from "react-hot-toast";

import "@rainbow-me/rainbowkit/styles.css";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { wagmiClient } from "~~/services/web3/wagmiClient";
import { BlockieAvatar } from "~~/components/scaffold-eth";

import Header from "~~/components/Header";
import Footer from "~~/components/Footer";

import { useEffect, useMemo } from "react";
import { useAppStore } from "~~/services/store/store";
import { useEthPrice } from "~~/hooks/scaffold-eth";

import NextNProgress from "nextjs-progressbar";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Scene = dynamic(() => import("../components/Scene"), { ssr: true });

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useEthPrice();
  const setEthPrice = useAppStore(state => state.setEthPrice);

  //get the page route
  const { route } = useRouter();
  console.log("route", route);
  const threeJsRoutes = useMemo(() => ["/three"], []);
  const isThreeJs = threeJsRoutes.includes(route);

  useEffect(() => {
    if (price > 0) {
      setEthPrice(price);
    }
  }, [setEthPrice, price]);

  return (
    <WagmiConfig client={wagmiClient}>
      <NextNProgress />
      <RainbowKitProvider chains={appChains.chains} avatar={BlockieAvatar}>
        <div className="flex flex-col min-h-screen">
          {!isThreeJs && <Header />}
          <main className="relative flex flex-col flex-1">
            {isThreeJs ? (
              <Scene className="pointer-events-none" eventPrefix="client">
                <Component {...pageProps} />
              </Scene>
            ) : (
              <Component {...pageProps} />
            )}
          </main>
          {!isThreeJs && <Footer />}
        </div>
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
