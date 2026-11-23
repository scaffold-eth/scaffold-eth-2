import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes, NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  targetNetwork: {
    ...scaffoldConfig.targetNetworks[0],
    ...NETWORKS_EXTRA_DATA[scaffoldConfig.targetNetworks[0].id],
  },
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
}));
