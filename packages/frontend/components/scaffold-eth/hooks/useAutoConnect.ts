import { Provider } from "@wagmi/core";
import { ethers } from "ethers";
import { JsonRpcProvider, FallbackProvider } from "@ethersproject/providers";
import { useEffect } from "react";
import { chain, Connector, useAccount, useConnect, useProvider } from "wagmi";
import { useBurnerWallet } from "~~/components/scaffold-eth/hooks/useBurnerWallet";
import { useEffectOnce, useIsMounted, useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { burnerWalletId, burnerWalletName, defaultBurnerChainId } from "~~/web3";

// const supportedRpcUrls = [
//   chain.localhost.rpcUrls.default,
//   chain.localhost.rpcUrls.default.replace("127.0.0.1", "localhost"),
//   chain.hardhat.rpcUrls.default,
//   chain.localhost.rpcUrls.default.replace("127.0.0.1", "localhost"),
// ];

export type TAutoConnect = {
  /**
   * Enable the burner wallet.  If this is disabled, burner wallet is entierly disabled
   */
  enableBurnerWallet: boolean;
  /**
   * Always autoConnectToBurner to burner wallet on page load.
   */
  alwaysAutoConnectToBurnerOnLoad: boolean;
  /**
   * If user is not connected to any wallet:  On reload, connect to burner wallet
   */
  connectToBurnerIfDisconnectedOnLoad: boolean;
  /**
   * Auto connect: If the user was connected into a wallet before, on page reload reconnect automatically
   */
  allowAutoConnect: boolean;
};

const walletIdStorageKey = "scaffoldEth2.wallet";

/**
 * This function will get the initial connector (if any), the app will connect to
 * @param config
 * @param previousWalletId
 * @param connectors
 * @returns
 */
const getInitialConnector = (
  config: TAutoConnect,
  previousWalletId: string,
  connectors: Connector<any, any, any>[],
): { connector: Connector | undefined; chainId?: number } | undefined => {
  const allowBurner = config.enableBurnerWallet;

  if (allowBurner && config.alwaysAutoConnectToBurnerOnLoad) {
    const connector = connectors.find((f) => f.id === burnerWalletId);
    return { connector, chainId: defaultBurnerChainId };
  } else if (!!!previousWalletId) {
    // The user was not connected to a wallet
    if (allowBurner && config.connectToBurnerIfDisconnectedOnLoad) {
      const connector = connectors.find((f) => f.id === burnerWalletId);
      return { connector, chainId: defaultBurnerChainId };
    }
  } else {
    // the user was connected to wallet
    if (config.allowAutoConnect) {
      const connector = connectors.find((f) => f.id === previousWalletId);
      return { connector };
    }
  }

  return undefined;
};

/**
 * Automatically connect to a wallet/connector based on config and prior wallet
 * @param config
 */
export const useAutoConnect = (config: TAutoConnect): void => {
  const [walletId, setWalletId] = useLocalStorage<string>(walletIdStorageKey, "");
  const connectState = useConnect();
  const accountState = useAccount();
  const { saveBurner } = useBurnerWallet();

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
    const initialConnector = getInitialConnector(config, walletId, connectState.connectors);

    if (initialConnector?.connector) {
      connectState.connect({ connector: initialConnector.connector, chainId: initialConnector.chainId });

      if (initialConnector.connector.id == burnerWalletId) {
        saveBurner();
      }
    }
  });
};
