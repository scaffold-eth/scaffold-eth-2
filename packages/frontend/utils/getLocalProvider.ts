import { Chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

export default function getLocalProvider(chain: Chain) {
  const chainProviderFunc = publicProvider();

  const chainProviderObj = chainProviderFunc(chain);

  const provider = chainProviderObj?.provider();

  return provider;
}
