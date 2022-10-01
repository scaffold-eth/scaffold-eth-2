import { Provider } from "@wagmi/core";
import { ethers } from "ethers";
import { JsonRpcProvider, FallbackProvider } from "@ethersproject/providers";
import { useEffect } from "react";
import { chain, Connector, useAccount, useConnect, useProvider } from "wagmi";
import { useBurnerSigner } from "~~/components/scaffold-eth/hooks/useBurnerSigner";
import { useEffectOnce, useIsMounted, useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { burnerWalletId, burnerWalletName, defaultBurnerChainId } from "~~/web3";

const supportedRpcUrls = [
  chain.localhost.rpcUrls.default,
  chain.localhost.rpcUrls.default.replace("127.0.0.1", "localhost"),
  chain.hardhat.rpcUrls.default,
  chain.localhost.rpcUrls.default.replace("127.0.0.1", "localhost"),
];

// const doesCurrentNetworkSupportBurner = (provider: Provider, currentConnector: Connector): boolean => {
//   try {
//     return true;
//     // if (currentConnector == null || currentConnector.id === burnerWalletId) {
//     //   return true;
//     // }

//     // if (provider instanceof FallbackProvider) {
//     //   await provider.get();
//     //   provider.providerConfigs.find((f) => f.provider.getNetwork());
//     // }

//     const jsonProvider: JsonRpcProvider = provider as JsonRpcProvider;
//     const sameUrl = supportedRpcUrls.some((s) => s === jsonProvider?.connection?.url);
//     return sameUrl;
//   } catch {
//     return false;
//   }
// };
export type TAutoConnect = {
  /**
   * is burnerwallet enabled
   */
  enableBurner: boolean;
  /**
   * always autoConnectToBurner to burner wallet on load
   */
  alwaysAutoConnectToBurner: boolean;
  /**
   * if user is disconnected, reconnect to burner
   */
  connectToBurnerIfDisconnected: boolean;
  /**
   * If the user was connected into a wallet before, reconnect automatically
   */
  autoConnect: boolean;
};

const walletIdStorageKey = "scaffoldEth2.wallet";

const getInitialConnector = (
  config: TAutoConnect,
  previousWalletName: string,
  isBurnerSupported: boolean,
  connectors: Connector<any, any, any>[],
): { connector: Connector | undefined; chainId?: number } | undefined => {
  const allowBurner = config.enableBurner && isBurnerSupported;

  if (allowBurner && config.alwaysAutoConnectToBurner) {
    const connector = connectors.find((f) => f.id === burnerWalletId);
    return { connector, chainId: defaultBurnerChainId };
  } else if (!!!previousWalletName) {
    // The user was not connected to a wallet
    if (allowBurner && config.connectToBurnerIfDisconnected) {
      const connector = connectors.find((f) => f.id === burnerWalletId);
      return { connector, chainId: defaultBurnerChainId };
    }
  } else {
    // the user was connected to wallet
    if (config.autoConnect) {
      const connector = connectors.find((f) => f.name === previousWalletName);
      return { connector };
    }
  }

  return undefined;
};

export const useAutoConnect = (config: TAutoConnect): void => {
  const [walletId, setWalletId] = useLocalStorage<string>(walletIdStorageKey, "");
  const provider = useProvider();
  const connectState = useConnect();
  const accountState = useAccount();

  const isBurnerSupported = true; //doesCurrentNetworkSupportBurner(provider, accountState.connector);

  useEffect(() => {
    if (accountState.isConnected) {
      // user is connected, set walletName
      setWalletId(accountState.connector?.id ?? "");
    } else {
      // user has disconnected, reset walletName
      setWalletId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountState.isConnected, accountState.connector?.name]);

  useEffectOnce(() => {
    const initialConnector = getInitialConnector(config, walletId, isBurnerSupported, connectState.connectors);

    if (initialConnector?.connector) {
      connectState.connect({ connector: initialConnector.connector, chainId: initialConnector.chainId });
    }
  });
};
