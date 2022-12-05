import create from "zustand";
import { createAnotherSlice } from "~~/services/store/slices/anotherExampleSlice";
import { createTempSlice } from "~~/services/store/slices/tempSlice";
import { createPriceSlice } from "~~/services/store/slices/priceSlice";
import { TAppStore } from "~~/services/store/storeTypes";

// -----------------------
// Add those slices to the store
// -----------------------
export const useAppStore = create<TAppStore>()((...set) => ({
  tempSlice: createTempSlice(...set),
  anotherExampleSlice: createAnotherSlice(...set),
  priceSlice: createPriceSlice(...set),
}));
