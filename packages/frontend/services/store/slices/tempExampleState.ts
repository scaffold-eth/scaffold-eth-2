export type TTempState = {
  tempStuff: string;
};

export const defaultTempState = (): TTempState => {
  return {
    tempStuff: "i am temporary",
  };
};

export type TempStateSlice = {
  tempState: TTempState;
  setTempState: (newTempState: TTempState) => void;
};
