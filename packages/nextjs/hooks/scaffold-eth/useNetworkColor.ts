import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { useDarkMode } from "usehooks-ts";

/**
 * Gets the color of the target network
 */
export const useNetworkColor = () => {
  const { isDarkMode } = useDarkMode();
  const networkDetails = getTargetNetwork();

  return Array.isArray(networkDetails.color)
    ? isDarkMode
      ? networkDetails.color[1]
      : networkDetails.color[0]
    : networkDetails.color;
};
