import { StateCreator } from "zustand";
import { TempSlice } from "~~/services/store/slices/tempSlice";
import { TEthPriceSlice } from "~~/services/store/slices/ethPriceSlice";

/**
 * The App store definition
 */
export type TAppStore = {
  tempSlice: TempSlice;
  ethPriceSlice: TEthPriceSlice;
  /**
   * Add more slices here
   */
};

/***
 * Helper to create slices
 */
export type TAppSliceCreator<TStateSlice> = StateCreator<TAppStore, [], [], TStateSlice>;
