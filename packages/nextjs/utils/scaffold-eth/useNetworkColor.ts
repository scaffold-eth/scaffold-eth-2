import { getTargetNetwork } from "./networks";
import { useDarkMode } from "usehooks-ts";

export function useNetworkColor() {
  const { isDarkMode } = useDarkMode();
  const networkDetails = getTargetNetwork();

  return Array.isArray(networkDetails.color)
    ? isDarkMode
      ? networkDetails.color[1]
      : networkDetails.color[0]
    : networkDetails.color;
}
