import { TAppSliceCreator, TAppStore } from "~~/services/store/storeTypes";

export type TExampleData = {
  block: string;
  balance: number;
};

export const defaultExampleState = (): TExampleData => {
  return {
    block: "sdfs",
    balance: 0,
  };
};

export type TAnotherExampleSlice = {
  exampleData: TExampleData;
  setExampleData: (newTempState: TExampleData) => void;
  tempMoonCountState: number;
  setTempMoonCountState: (newMoon: number) => void;
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
  tempMoonCountState: 0,
  setTempMoonCountState: (newValue: number): void =>
    set((state): TAppStore => {
      state.anotherExampleSlice.tempMoonCountState = newValue;
      return state;
    }),
});
