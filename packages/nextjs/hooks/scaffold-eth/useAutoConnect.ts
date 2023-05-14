import { useEffect } from "react";
import { useEffectOnce, useLocalStorage } from "usehooks-ts";
import { Connector, useAccount, useConnect } from "wagmi";
import { hardhat } from "wagmi/chains";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletId, defaultBurnerChainId } from "~~/services/web3/wagmi-burner/BurnerConnector";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const walletIdStorageKey = "scaffoldEth2.wallet";
const SAFE_ID = "safe";

/**
 * This function will get the initial wallet connector (if any), the app will connect to
 * @param previousWalletId
 * @param connectors
 * @returns
 */
const getInitialConnector = (
  previousWalletId: string,
  connectors: Connector<any, any, any>[],
): { connector: Connector | undefined; chainId?: number } | undefined => {
  const connectorMap = new Map<string, Connector>();
  connectors.forEach(connector => connectorMap.set(connector.id, connector));

  // Look for the SAFE connector instance and connect to it instantly if loaded in SAFE frame
  const safeConnectorInstance = connectorMap.get(SAFE_ID)?.ready ? connectorMap.get(SAFE_ID) : undefined;
  if (safeConnectorInstance) {
    return { connector: safeConnectorInstance };
  }

  const burnerWalletConfig = scaffoldConfig.burnerWallet;
  const allowBurner =
    burnerWalletConfig.enabled && (burnerWalletConfig.onlyLocal ? getTargetNetwork().id === hardhat.id : true);

  // Check if the user was previously connected to a wallet
  if (previousWalletId) {
    if (scaffoldConfig.walletAutoConnect) {
      // Don't connect if the user was previously connected to the burner wallet and burner is not allowed
      if (previousWalletId === burnerWalletId && !allowBurner) return undefined;

      return { connector: connectorMap.get(previousWalletId) };
    }
  } else if (scaffoldConfig.walletAutoConnect && allowBurner) {
    // If the user was not previously connected to a wallet, connect to the burner wallet if allowed
    return { connector: connectorMap.get(burnerWalletId), chainId: defaultBurnerChainId };
  }

  return undefined;
};

/**
 * Automatically connect to a wallet/connector based on config and prior wallet
 */
export const useAutoConnect = (): void => {
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
    const initialConnector = getInitialConnector(walletId, connectState.connectors);

    if (initialConnector?.connector) {
      connectState.connect({ connector: initialConnector.connector, chainId: initialConnector.chainId });
    }
  });
};
