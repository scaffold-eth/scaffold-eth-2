import { useEffect } from "react";
import { useEffectOnce, useLocalStorage } from "usehooks-ts";
import { Connector, useAccount, useConnect } from "wagmi";
import { hardhat } from "wagmi/dist/chains";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletId, defaultBurnerChainId } from "~~/services/web3/wagmi-burner/BurnerConnector";

export type TAutoConnect = {
  /**
   * Enable the burner wallet.  If this is disabled, burner wallet is entierly disabled
   */
  enableBurnerWallet: boolean;
  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet
   */
  autoConnect: boolean;
};

const walletIdStorageKey = "scaffoldEth2.wallet";

/**
 * This function will get the initial wallet connector (if any), the app will connect to
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
  const isLocalChainSelected = scaffoldConfig.targetNetwork.id === hardhat.id;

  if (!previousWalletId) {
    // The user was not connected to a wallet
    if (isLocalChainSelected && allowBurner && config.autoConnect) {
      const connector = connectors.find(f => f.id === burnerWalletId);
      return { connector, chainId: defaultBurnerChainId };
    }
  } else {
    // the user was connected to wallet
    if (config.autoConnect) {
      if (previousWalletId === burnerWalletId && !isLocalChainSelected) {
        return;
      }

      const connector = connectors.find(f => f.id === previousWalletId);
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
    }
  });
};
