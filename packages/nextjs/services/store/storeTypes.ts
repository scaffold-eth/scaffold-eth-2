import { StateCreator } from "zustand";
import { TempSlice } from "~~/services/store/slices/tempSlice";
import { TAnotherExampleSlice } from "~~/services/store/slices/anotherExampleSlice";

/**
 * The App store definition
 */
export type TAppStore = {
  tempSlice: TempSlice;
  anotherExampleSlice: TAnotherExampleSlice;
  /**
   * Add more slices here
   */
};

/***
 * Helper to create slices
 */
export type TAppSliceCreator<TStateSlice> = StateCreator<TAppStore, [], [], TStateSlice>;
