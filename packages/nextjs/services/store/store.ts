import create from "zustand";
import { createAnotherSlice } from "~~/services/store/slices/anotherExampleSlice";
import { createTempSlice } from "~~/services/store/slices/tempSlice";
import { createEthPriceSlice } from "~~/services/store/slices/ethPriceSlice";
import { TAppStore } from "~~/services/store/storeTypes";

// -----------------------
// Add those slices to the store
// -----------------------
export const useAppStore = create<TAppStore>()((...set) => ({
  tempSlice: createTempSlice(...set),
  anotherExampleSlice: createAnotherSlice(...set),
  ethPriceSlice: createEthPriceSlice(...set),
}));
