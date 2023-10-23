import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Chain, Hex, HttpTransport, PrivateKeyAccount, createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { WalletClient, usePublicClient } from "wagmi";

const burnerStorageKey = "scaffoldEth2.burnerWallet.sk";

/**
 * Is the private key valid
 * @internal
 * @param pk
 * @returns
 */
const isValidSk = (pk: Hex | string | undefined | null): boolean => {
  return pk?.length === 64 || pk?.length === 66;
};

/**
 * If no burner is found in localstorage, we will generate a random private key
 */
const newDefaultPriaveKey = generatePrivateKey();

/**
 * Save the current burner private key from storage
 * Can be used outside of react.  Used by the burnerConnector.
 * @internal
 * @returns
 */
export const saveBurnerSK = (privateKey: Hex): void => {
  if (typeof window != "undefined" && window != null) {
    window?.localStorage?.setItem(burnerStorageKey, privateKey);
  }
};

/**
 * Gets the current burner private key from storage
 * Can be used outside of react.  Used by the burnerConnector.
 * @internal
 * @returns
 */
export const loadBurnerSK = (): Hex => {
  let currentSk: Hex = "0x";
  if (typeof window != "undefined" && window != null) {
    currentSk = (window?.localStorage?.getItem?.(burnerStorageKey)?.replaceAll('"', "") ?? "0x") as Hex;
  }

  if (!!currentSk && isValidSk(currentSk)) {
    return currentSk;
  } else {
    saveBurnerSK(newDefaultPriaveKey);
    return newDefaultPriaveKey;
  }
};

/**
 * #### Summary
 * Return type of useBurnerSigner:
 *
 * ##### ✏️ Notes
 * - provides signer
 * - methods of interacting with burner signer
 * - methods to save and loadd signer from local storage
 *
 * @category Hooks
 */
export type TBurnerSigner = {
  walletClient: WalletClient | undefined;
  account: PrivateKeyAccount | undefined;
  /**
   * create a new burner signer
   */
  generateNewBurner: () => void;
  /**
   * explictly save burner to storage
   */
  saveBurner: () => void;
};

/**
 * #### Summary
 * A hook that creates a burner signer/address and provides ways of interacting with
 * and updating the signer
 *
 * @category Hooks
 *
 * @param localProvider localhost provider
 * @returns IBurnerSigner
 */
export const useBurnerWallet = (): TBurnerSigner => {
  const [burnerSk, setBurnerSk] = useLocalStorage<Hex>(burnerStorageKey, newDefaultPriaveKey);

  const publicClient = usePublicClient();
  const [walletClient, setWalletClient] = useState<WalletClient<HttpTransport, Chain, PrivateKeyAccount>>();
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState<Hex>("0x");
  const [account, setAccount] = useState<PrivateKeyAccount>();
  const isCreatingNewBurnerRef = useRef(false);

  /**
   * callback to save current wallet sk
   */
  const saveBurner = useCallback(() => {
    setBurnerSk(generatedPrivateKey);
  }, [setBurnerSk, generatedPrivateKey]);

  /**
   * create a new burnerkey
   */
  const generateNewBurner = useCallback(() => {
    if (publicClient && !isCreatingNewBurnerRef.current) {
      console.log("🔑 Create new burner wallet...");
      isCreatingNewBurnerRef.current = true;

      const randomPrivateKey = generatePrivateKey();
      const randomAccount = privateKeyToAccount(randomPrivateKey);

      const client = createWalletClient({
        chain: publicClient.chain,
        account: randomAccount,
        transport: http(),
      });

      setWalletClient(client);
      setGeneratedPrivateKey(randomPrivateKey);
      setAccount(randomAccount);

      setBurnerSk(() => {
        console.log("🔥 ...Save new burner wallet");
        isCreatingNewBurnerRef.current = false;
        return randomPrivateKey;
      });
      return client;
    } else {
      console.log("⚠ Could not create burner wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient.chain.id]);

  /**
   * Load wallet with burnerSk
   * connect and set wallet, once we have burnerSk and valid provider
   */
  useEffect(() => {
    if (burnerSk && publicClient.chain.id) {
      let wallet: WalletClient<HttpTransport, Chain, PrivateKeyAccount> | undefined = undefined;
      if (isValidSk(burnerSk)) {
        const randomAccount = privateKeyToAccount(burnerSk);

        wallet = createWalletClient({
          chain: publicClient.chain,
          account: randomAccount,
          transport: http(),
        });

        setGeneratedPrivateKey(burnerSk);
        setAccount(randomAccount);
      } else {
        wallet = generateNewBurner();
      }

      if (wallet == null) {
        throw "Error:  Could not create burner wallet";
      }

      setWalletClient(wallet);
      saveBurner();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burnerSk, publicClient.chain.id]);

  return {
    walletClient,
    account,
    generateNewBurner,
    saveBurner,
  };
};
