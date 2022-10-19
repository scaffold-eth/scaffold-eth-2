import { Chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

/**
  @dev Get the localProvider for given chain
  @param chain : specific chain for localProvider
  @return public provider for passed chain
**/
export default function getLocalProvider(chain: Chain) {
  const chainProviderFunc = publicProvider();

  const chainProviderObj = chainProviderFunc(chain);

  const provider = chainProviderObj?.provider();

  return provider;
}
