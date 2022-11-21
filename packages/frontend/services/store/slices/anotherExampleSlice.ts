import { TAppSliceCreator, TAppStore } from "~~/services/store/storeTypes";

export type TExampleData = {
  tempStuff: Array<string>;
};

export const defaultExampleState = (): TExampleData => {
  return {
    tempStuff: [],
  };
};

export type TAnotherExampleSlice = {
  exampleData: TExampleData;
  setExampleData: (newTempState: TExampleData) => void;
  /**
   * add more data here for this slice
   */
};

export const createAnotherSlice: TAppSliceCreator<TAnotherExampleSlice> = set => ({
  exampleData: defaultExampleState(),
  setExampleData: (newValue: TExampleData): void =>
    set((state): TAppStore => {
      state.anotherExampleSlice.exampleData = newValue;
      return state;
    }),
});
