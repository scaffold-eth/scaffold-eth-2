import { StateCreator } from "zustand";
import { TempSlice } from "~~/services/store/slices/tempSlice";
import { TAnotherExampleSlice } from "~~/services/store/slices/anotherExampleSlice";
import { TEthPriceSlice } from "~~/services/store/slices/ethPriceSlice";

/**
 * The App store definition
 */
export type TAppStore = {
  tempSlice: TempSlice;
  anotherExampleSlice: TAnotherExampleSlice;
  ethPriceSlice: TEthPriceSlice;
  /**
   * Add more slices here
   */
};

/***
 * Helper to create slices
 */
export type TAppSliceCreator<TStateSlice> = StateCreator<TAppStore, [], [], TStateSlice>;
