import { getNetworkDetailsByChainId } from "./networks";
import { useDarkMode } from "usehooks-ts";

export function useNetworkColor(chainId?: number) {
  const { isDarkMode } = useDarkMode();
  const networkDetails = chainId && getNetworkDetailsByChainId(chainId);
  if (!networkDetails) return "#666666";

  return Array.isArray(networkDetails.color)
    ? isDarkMode
      ? networkDetails.color[1]
      : networkDetails.color[0]
    : networkDetails.color;
}
