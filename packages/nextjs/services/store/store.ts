import create from "zustand";
import { createTempSlice } from "~~/services/store/slices/tempSlice";
import { createEthPriceSlice } from "~~/services/store/slices/ethPriceSlice";
import { TAppStore } from "~~/services/store/storeTypes";

// -----------------------
// Add those slices to the store
// -----------------------
export const useAppStore = create<TAppStore>()((...set) => ({
  tempSlice: createTempSlice(...set),
  ethPriceSlice: createEthPriceSlice(...set),
}));
