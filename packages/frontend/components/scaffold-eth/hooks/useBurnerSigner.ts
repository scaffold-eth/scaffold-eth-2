import { BytesLike, ethers, Signer, Wallet } from "ethers";
import { useEffect, useCallback, useRef } from "react";
import { useProvider } from "wagmi";
import { useDebounce } from "use-debounce";
import { useLocalStorage } from "usehooks-ts";

const storageKey = "scaffoldEth2.burnerwallet.sk";

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
 * Gets the current burner private key from storage
 * Can be used outside of react
 * @internal
 * @returns
 */
export const loadBurnerWallet = (): Wallet => {
  let currentSk = "";
  if (typeof window != "undefined" && window != null) {
    currentSk = window?.localStorage?.getItem?.(storageKey)?.replaceAll('"', "") ?? "";
  }
  if (!!currentSk && isValidSk(currentSk)) {
    return new ethers.Wallet(currentSk);
  } else {
    return newDefaultWallet;
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
  signer: Signer | undefined;
  account: string | undefined;
  /**
   * create a new burner signer
   */
  generateNewBurnerSigner: () => void;
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
export const useBurnerSigner = (): TBurnerSigner => {
  const [burnerSk, setBurnerSk] = useLocalStorage<BytesLike>(storageKey, newDefaultWallet.privateKey);

  const provider = useProvider();
  const walletRef = useRef<Wallet>();
  const isCreatingNewBurnerRef = useRef(false);

  const [signer] = useDebounce(walletRef.current, 200, {
    trailing: true,
    equalityFn: (a, b) => a?.address === b?.address && a != null && b != null,
  });
  const account = walletRef.current?.address;

  /**
   * create a new burnerkey
   */
  const generateNewBurnerSigner = useCallback(() => {
    if (provider && !isCreatingNewBurnerRef.current) {
      console.log("🔑 Create new burner wallet...");
      isCreatingNewBurnerRef.current = true;

      const wallet = Wallet.createRandom();
      setBurnerSk(() => {
        console.log("🔥 ...Setting burner");
        isCreatingNewBurnerRef.current = false;
        return wallet.privateKey;
      });
      return wallet;
    } else {
      console.log("⚠ Could not create burner wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    // connect and set wallet, once we have burnerSk and valid provider
    if (burnerSk && provider) {
      let wallet: Wallet | undefined = undefined;
      if (isValidSk(burnerSk)) {
        wallet = new ethers.Wallet(burnerSk);
      } else {
        wallet = generateNewBurnerSigner();
      }

      if (wallet == null) {
        throw "Error:  Could not create burner wallet";
      }

      const newSigner = wallet.connect(provider);
      walletRef.current = newSigner;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burnerSk, generateNewBurnerSigner, provider]);

  return {
    signer,
    account,
    generateNewBurnerSigner,
  };
};
