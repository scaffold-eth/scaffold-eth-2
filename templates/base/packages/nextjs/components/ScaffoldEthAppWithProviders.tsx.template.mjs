import { stringify, withDefaults } from "../../../../utils.js";

const defaultProviders = {
  WagmiProvider: { config: "$$wagmiConfig$$" },
  QueryClientProvider: { client: "$$queryClient$$" },
  RainbowKitProvider: {
    avatar: "$$BlockieAvatar$$",
    theme: "$$mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()$$"
  }
};

const contents = ({ preContent, globalClassNames, extraProviders, overrideProviders }) => {
  const providersObject =
    overrideProviders?.[0] && Object.keys(overrideProviders[0]).length > 0
      ? overrideProviders[0]
      : { ...defaultProviders, ...(extraProviders[0] || {}) };

  const providerEntries = Object.entries(providersObject);
  const providerOpeningTags = providerEntries.map(([providerName, props]) => {
    const propAssignments = Object.entries(props).map(([propName, propValue]) => 
      `${propName}={${stringify(propValue)}}`
    ).join(' ');
    return `<${providerName} ${propAssignments}>`;
  }).join('\n    ');

  const providerClosingTags = providerEntries.reverse().map(([providerName]) => {
    return `</${providerName}>`;
  }).join('\n    ');

  return `"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
${preContent[0] || ''}

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className={\`flex flex-col min-h-screen ${globalClassNames}\`}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    ${providerOpeningTags}
      <ProgressBar height="3px" color="#2299dd" />
      <ScaffoldEthApp>{children}</ScaffoldEthApp>
    ${providerClosingTags}
  );
};`;
};

export default withDefaults(contents, {
  preContent: "",
  globalClassNames: "",
  extraProviders: {},
  overrideProviders: {},
});
