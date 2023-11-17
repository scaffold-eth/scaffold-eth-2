import { useDarkMode } from "usehooks-ts";
import { useScaffoldConfig } from "~~/context/ScaffoldConfigContext";

const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

/**
 * Gets the color of the target network
 */
export const useNetworkColor = () => {
  const { isDarkMode } = useDarkMode();
  const { config } = useScaffoldConfig();
  const colorConfig = config.color ?? DEFAULT_NETWORK_COLOR;

  return Array.isArray(colorConfig) ? (isDarkMode ? colorConfig[1] : colorConfig[0]) : colorConfig;
};
