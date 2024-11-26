import { withDefaults } from "../../../../utils.js";

const contents = ({ providerNames, providerSetups, providerImports, providerProps, globalClassNames }) => {
  // filter out empty strings
  const providerOpeningTags = providerNames.filter(Boolean).map((name, index) => `<${name} ${providerProps[index]}>`);

  const providerClosingTags = providerNames.filter(Boolean).map(name => `</${name}>`).reverse();

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
${providerImports.filter(Boolean).join("\n")}

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

${providerSetups.filter(Boolean).join("\n")}

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          ${providerOpeningTags.join("\n")}
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
          ${providerClosingTags.join("\n")}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};`;
};

export default withDefaults(contents, {
  providerNames: "",
  providerSetups: "",
  providerImports: "",
  providerProps: "",
  globalClassNames: "",
});
