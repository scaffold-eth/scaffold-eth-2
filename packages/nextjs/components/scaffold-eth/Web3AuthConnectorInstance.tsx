// Web3Auth Libraries
import { Wallet } from "@rainbow-me/rainbowkit";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Chain, Connector } from "wagmi";

export default function Web3AuthConnectorInstance(chains: Chain[]) {
  // Create Web3Auth Instance
  const name = "Scaffold-ETH w/ Web3Auth";
  const iconUrl = "./logo.svg";
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x" + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0], // This is the public RPC we have added, please pass on your own endpoint while creating an app
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
    blockExplorer: chains[0].blockExplorers?.default.url[0] as string,
  };

  const web3AuthInstance = new Web3Auth({
    clientId: "YOUR_CLIENT_ID",
    chainConfig,
    uiConfig: {
      appName: name,
      theme: "light",
      loginMethodsOrder: ["google", "facebook", "twitter", "discord"],
      defaultLanguage: "en",
      appLogo: iconUrl, // Your App Logo Here
      modalZIndex: "2147483647",
    },
    web3AuthNetwork: "cyan",
    enableLogging: true,
  });

  // Add openlogin adapter for customisations
  const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
  const openloginAdapterInstance = new OpenloginAdapter({
    privateKeyProvider,
    adapterSettings: {
      network: "cyan",
      uxMode: "popup",
      whiteLabel: {
        name: "Scaffold-ETH w/ Web3Auth",
        logoLight: iconUrl,
        logoDark: iconUrl,
        defaultLanguage: "en",
        dark: true, // whether to enable dark mode. defaultValue: false
      },
    },
  });
  web3AuthInstance.configureAdapter(openloginAdapterInstance);

  return {
    web3AuthConnectorInstance: {
      id: "web3auth",
      name,
      iconUrl,
      iconBackground: "#fff",
      createConnector: () => {
        const connector = new Web3AuthConnector({
          chains: chains,
          options: {
            web3AuthInstance,
            modalConfig: {
              [WALLET_ADAPTERS.OPENLOGIN]: {
                loginMethods: {
                  google: {
                    name: "google login",
                  },
                  facebook: {
                    name: "facebook login",
                  },
                },
              },
            } as any,
          },
        });
        return {
          connector,
        };
      },
    } as Wallet<Connector<any, any>>,
    web3AuthInstance: web3AuthInstance,
  };
}
