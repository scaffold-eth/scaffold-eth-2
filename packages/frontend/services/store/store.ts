import { default as create } from "zustand";
import { AnotherTempStateSlice } from "~~/services/store/slices/anotherExampleTempState";

import { defaultTempState, TempStateSlice, TTempState } from "~~/services/store/slices/tempExampleState";
import { TAppSliceCreator, TAppStore } from "./storeTypes";

// -----------------------
// Add slices here
// -----------------------

const createTempStateSlice: TAppSliceCreator<TempStateSlice> = set => ({
  tempState: defaultTempState(),
  setTempState: (newTempState: TTempState): void =>
    set((state): TAppStore => {
      state.tempState = newTempState;
      return state;
    }),
});

const createAnotherTempStateSlice: TAppSliceCreator<AnotherTempStateSlice> = set => ({
  tempState: defaultTempState(),
  setTempState: (newTempState: TTempState): void =>
    set((state): TAppStore => {
      state.tempState = newTempState;
      return state;
    }),
});

// -----------------------
// Add those slices to the store
// -----------------------

export const useAppStore = create<TAppStore>()((...set) => ({
  ...createTempStateSlice(...set),
  ...createAnotherTempStateSlice(...set),
}));
