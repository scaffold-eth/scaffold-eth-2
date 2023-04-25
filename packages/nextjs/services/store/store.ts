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
  nativeCurrencyPrice: number;
  setNativeCurrency: (newNativeCurrencyState: number) => void;
};

export const useAppStore = create<TAppStore>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrency: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
}));
