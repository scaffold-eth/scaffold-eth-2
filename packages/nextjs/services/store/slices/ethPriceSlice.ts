import { TAppSliceCreator, TAppStore } from "~~/services/store/storeTypes";

export const defaultEthPriceState = (): number => {
  return 0;
};

export type TEthPriceSlice = {
  ethPrice: number;
  setEthPrice: (newEthPriceState: number) => void;
};

export const createEthPriceSlice: TAppSliceCreator<TEthPriceSlice> = set => ({
  ethPrice: defaultEthPriceState(),
  setEthPrice: (newValue: number): void =>
    set((state): TAppStore => {
      state.ethPriceSlice.ethPrice = newValue;
      return state;
    }),
});
