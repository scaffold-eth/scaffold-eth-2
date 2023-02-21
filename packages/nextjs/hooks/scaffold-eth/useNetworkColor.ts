import { getTargetNetwork, NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";
import { useDarkMode } from "usehooks-ts";

const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

/**
 * Gets the color of the target network
 */
export const useNetworkColor = () => {
  const { isDarkMode } = useDarkMode();
  const configuredChain = getTargetNetwork();
  const networkDetails = NETWORKS_EXTRA_DATA[configuredChain.id] ?? { color: DEFAULT_NETWORK_COLOR };

  return Array.isArray(networkDetails.color)
    ? isDarkMode
      ? networkDetails.color[1]
      : networkDetails.color[0]
    : networkDetails.color;
};
