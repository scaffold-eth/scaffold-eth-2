import { TAppSliceCreator, TAppStore } from "~~/services/store/storeTypes";

export type TPriceData = {
  price: number;
};

export const defaultPriceState = (): TPriceData => {
  return {
    price: 0,
  };
};

export type TPriceSlice = {
  priceData: TPriceData;
  setPriceData: (newPriceState: TPriceData) => void;
};

export const createPriceSlice: TAppSliceCreator<TPriceSlice> = set => ({
  priceData: defaultPriceState(),
  setPriceData: (newValue: TPriceData): void =>
    set((state): TAppStore => {
      state.priceSlice.priceData = newValue;
      return state;
    }),
});
