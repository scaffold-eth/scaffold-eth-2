import { enabledChains, wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, http } from "viem";
import { hardhat } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(getAlchemyHttpUrl(chain.id)),
      ...(chain.id === (hardhat as Chain).id
        ? {
            pollingInterval: scaffoldConfig.pollingInterval,
          }
        : {}),
    });
  },
});
