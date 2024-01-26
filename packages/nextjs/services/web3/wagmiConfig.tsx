import { enabledChains } from "./wagmiConnectors";
import { createClient, http } from "viem";
import { hardhat } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

export const wagmiConfig = createConfig({
  // TODO: Maybe we should get literal value here currently TS has widened the types because of ensabledChains logic
  chains: enabledChains,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      // TODO: Create a file for alchmey links mapping and use fallback transport array so if alchmey fails fallbakc to default chain rpc
      transport: http(),
      ...(chain.id === hardhat.id
        ? {
            pollingInterval: scaffoldConfig.pollingInterval,
          }
        : {}),
    });
  },
});
