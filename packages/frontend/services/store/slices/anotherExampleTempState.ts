import { TTempState as TAnotherTempState } from "./tempExampleState";

export type TAnotherTempState2 = {
  tempStuff: string;
};

export const defaultTempState2 = (): TAnotherTempState => {
  return {
    tempStuff: "i am temporary",
  };
};

export type AnotherTempStateSlice = {
  tempState: TAnotherTempState;
  setTempState: (newTempState: TAnotherTempState) => void;
};
