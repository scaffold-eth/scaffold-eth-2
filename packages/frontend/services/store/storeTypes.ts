import { StateCreator } from "zustand";
import { TempStateSlice } from "~~/services/store/slices/tempExampleState";
import { AnotherTempStateSlice } from "~~/services/store/slices/anotherExampleTempState";

/**
 * The App store
 * All your slices of state should be joined here
 */

export type TAppStore = TempStateSlice & AnotherTempStateSlice;

/***
 * Helper to create slices
 */
export type TAppSliceCreator<TStateSlice> = StateCreator<TAppStore, [], [], TStateSlice>;
