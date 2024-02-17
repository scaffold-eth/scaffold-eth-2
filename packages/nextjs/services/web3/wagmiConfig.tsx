import { enabledChains, wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, http } from "viem";
import { hardhat } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

export const wagmiConfig = createConfig({
  // TODO: Maybe we should get literal value here currently TS has widened the types because of ensabledChains logic
  chains: enabledChains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      // TODO: Create a file for alchmey links mapping and use fallback transport array so if alchmey fails fallbakc to default chain rpc
      transport: http(),
      // TODO: Casting to Chain type to avoid TS literal compersion, we could in future use getTargetNetworks function
      ...(chain.id === (hardhat as Chain).id
        ? {
            pollingInterval: scaffoldConfig.pollingInterval,
          }
        : {}),
    });
  },
});
