import { Chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

/**
 * @dev Get the localProvider for given chain
 * @param {Chain} chain - specify chain for localProvider
 * @return public provider for passed chain
 */
export const getLocalProvider = (chain: Chain) => {
  const chainProviderLoader = publicProvider();
  const chainProviderData = chainProviderLoader(chain);
  const provider = chainProviderData?.provider();

  return provider;
};
