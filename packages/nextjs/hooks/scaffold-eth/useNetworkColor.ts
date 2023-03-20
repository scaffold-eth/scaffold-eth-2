import { useDarkMode } from "usehooks-ts";
import scaffoldConfig from "~~/scaffold.config";
import { NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";

const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

/**
 * Gets the color of the target network
 */
export const useNetworkColor = () => {
  const { isDarkMode } = useDarkMode();
  const networkDetails = NETWORKS_EXTRA_DATA[scaffoldConfig.targetNetwork.id] ?? { color: DEFAULT_NETWORK_COLOR };

  return Array.isArray(networkDetails.color)
    ? isDarkMode
      ? networkDetails.color[1]
      : networkDetails.color[0]
    : networkDetails.color;
};
