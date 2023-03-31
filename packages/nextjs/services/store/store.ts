import create from "zustand";

/**
 * Zustand Store
 *
 * You can add global state to the app using this AppStore, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TAppStore = {
  ethPrice: number;
  setEthPrice: (newEthPriceState: number) => void;
  refetchPrepareContractWriteCounter: number;
  triggerRefetchPrepareContractWrite: () => void;
};

export const useAppStore = create<TAppStore>(set => ({
  ethPrice: 0,
  setEthPrice: (newValue: number): void => set(() => ({ ethPrice: newValue })),
  refetchPrepareContractWriteCounter: 0,
  triggerRefetchPrepareContractWrite: (): void =>
    set(({ refetchPrepareContractWriteCounter }) => ({
      refetchPrepareContractWriteCounter: refetchPrepareContractWriteCounter + 1,
    })),
}));
