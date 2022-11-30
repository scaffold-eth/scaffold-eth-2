import { TAppSliceCreator, TAppStore } from "~~/services/store/storeTypes";

export type TExampleStuff = {
  tempStuff: string;
};

export const defaultExampleStuff = (): TExampleStuff => {
  return {
    tempStuff: "i am temporary",
  };
};

export type TempSlice = {
  tempState: TExampleStuff;
  setTempState: (newTempState: TExampleStuff) => void;
  /**
   * add more data here for this slice
   */
};

export const createTempSlice: TAppSliceCreator<TempSlice> = set => ({
  tempState: defaultExampleStuff(),
  setTempState: (newValue: TExampleStuff): void =>
    set((state): TAppStore => {
      state.tempSlice.tempState = newValue;
      return state;
    }),
});
