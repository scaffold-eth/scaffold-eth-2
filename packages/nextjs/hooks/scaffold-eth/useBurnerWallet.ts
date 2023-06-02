import { useCallback, useEffect, useRef } from "react";
import { BytesLike, Wallet, ethers } from "ethers";
import { useDebounce } from "use-debounce";
import { useLocalStorage } from "usehooks-ts";
import { WalletClient, usePublicClient } from "wagmi";

const burnerStorageKey = "scaffoldEth2.burnerWallet.sk";

/**
 * Is the private key valid
 * @internal
 * @param pk
 * @returns
 */
const isValidSk = (pk: BytesLike | undefined | null): boolean => {
  return pk?.length === 64 || pk?.length === 66;
};

/**
 * If no burner is found in localstorage, we will use a new default wallet
 */
const newDefaultWallet = ethers.Wallet.createRandom();

/**
 * Save the current burner private key from storage
 * Can be used outside of react.  Used by the burnerConnector.
 * @internal
 * @returns
 */
export const saveBurnerSK = (wallet: Wallet): void => {
  if (typeof window != "undefined" && window != null) {
    window?.localStorage?.setItem(burnerStorageKey, wallet.privateKey);
  }
};

/**
 * Gets the current burner private key from storage
 * Can be used outside of react.  Used by the burnerConnector.
 * @internal
 * @returns
 */
export const loadBurnerSK = (): string => {
  let currentSk = "";
  if (typeof window != "undefined" && window != null) {
    currentSk = window?.localStorage?.getItem?.(burnerStorageKey)?.replaceAll('"', "") ?? "";
  }

  if (!!currentSk && isValidSk(currentSk)) {
    return currentSk;
  } else {
    saveBurnerSK(newDefaultWallet);
    return newDefaultWallet.privateKey;
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
  account: string | undefined;
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
  const [burnerSk, setBurnerSk] = useLocalStorage<BytesLike>(burnerStorageKey, newDefaultWallet.privateKey);

  const publicClient = usePublicClient();
  const walletRef = useRef<Wallet>();
  const isCreatingNewBurnerRef = useRef(false);

  const [signer] = useDebounce(walletRef.current, 200, {
    trailing: true,
    equalityFn: (a, b) => a?.address === b?.address && a != null && b != null,
  });
  const account = walletRef.current?.address;

  /**
   * callback to save current wallet sk
   */
  const saveBurner = useCallback(() => {
    setBurnerSk(walletRef.current?.privateKey ?? "");
  }, [setBurnerSk]);

  /**
   * create a new burnerkey
   */
  const generateNewBurner = useCallback(() => {
    if (publicClient && !isCreatingNewBurnerRef.current) {
      console.log("🔑 Create new burner wallet...");
      isCreatingNewBurnerRef.current = true;

      const wallet = Wallet.createRandom().connect(publicClient);
      setBurnerSk(() => {
        console.log("🔥 ...Save new burner wallet");
        isCreatingNewBurnerRef.current = false;
        return wallet.privateKey;
      });
      return wallet;
    } else {
      console.log("⚠ Could not create burner wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient?.network?.chainId]);

  /**
   * Load wallet with burnerSk
   * connect and set wallet, once we have burnerSk and valid provider
   */
  useEffect(() => {
    if (burnerSk && publicClient.network.chainId) {
      let wallet: Wallet | undefined = undefined;
      if (isValidSk(burnerSk)) {
        wallet = new ethers.Wallet(burnerSk, publicClient);
      } else {
        wallet = generateNewBurner?.();
      }

      if (wallet == null) {
        throw "Error:  Could not create burner wallet";
      }
      walletRef.current = wallet;
      saveBurner?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burnerSk, publicClient?.network?.chainId]);

  return {
    walletClient: signer,
    account,
    generateNewBurner,
    saveBurner,
  };
};
