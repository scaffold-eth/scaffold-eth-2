import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import { NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth/networks";

/**
 * Given a chainId, retrives the network object from `scaffold.config`,
 * if not found default to network set by `useTargetNetwork` hook
 */
export function useSelectedNetwork(chainId?: AllowedChainIds) {
  const globalTargetNetwork = useGlobalState(({ targetNetwork }) => targetNetwork);
  const targetNetwork =
    scaffoldConfig.targetNetworks.find(targetNetwork => targetNetwork.id === chainId) ?? globalTargetNetwork;

  return targetNetwork ? { ...targetNetwork, ...NETWORKS_EXTRA_DATA[targetNetwork.id] } : targetNetwork;
}
