import { useTargetNetwork } from "./useTargetNetwork";
import { useTheme } from "next-themes";
import { AllowedChains } from "~~/utils/scaffold-eth";

export const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

export function getNetworkColor(network: AllowedChains, isDarkMode: boolean) {
  const colorConfig = network.color ?? DEFAULT_NETWORK_COLOR;
  return Array.isArray(colorConfig) ? (isDarkMode ? colorConfig[1] : colorConfig[0]) : colorConfig;
}

/**
 * Gets the color of the target network
 */
export const useNetworkColor = (chain?: AllowedChains) => {
  const { resolvedTheme } = useTheme();
  const { targetNetwork } = useTargetNetwork();

  const isDarkMode = resolvedTheme === "dark";

  return getNetworkColor(chain ? chain : targetNetwork, isDarkMode);
};
