import { useDarkMode } from "usehooks-ts";
import { useTargetNetwork } from "~~/utils/scaffold-eth";

const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

/**
 * Gets the color of the target network
 */
export const useNetworkColor = () => {
  const { isDarkMode } = useDarkMode();
  const targetNetwork = useTargetNetwork();
  const colorConfig = targetNetwork.color ?? DEFAULT_NETWORK_COLOR;

  return Array.isArray(colorConfig) ? (isDarkMode ? colorConfig[1] : colorConfig[0]) : colorConfig;
};
