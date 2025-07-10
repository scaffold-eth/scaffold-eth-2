import { deepMerge, withDefaults, stringify } from "../../../../../utils.js";

const defaultWagmiConfig = {
  chains: '$$enabledChains$$',
  connectors: '$$wagmiConnectors$$',
  ssr: true,
  client: `$$({ chain }) => { let rpcFallbacks = [http()]; const rpcOverrideUrl = (scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"])?.[chain.id]; if (rpcOverrideUrl) { rpcFallbacks = [http(rpcOverrideUrl), http()]; } else { const alchemyHttpUrl = getAlchemyHttpUrl(chain.id); if (alchemyHttpUrl) { const isUsingDefaultKey = scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY; rpcFallbacks = isUsingDefaultKey ? [http(), http(alchemyHttpUrl)] : [http(alchemyHttpUrl), http()]; } } return createClient({ chain, transport: fallback(rpcFallbacks), ...(chain.id !== (hardhat as Chain).id ? { pollingInterval: scaffoldConfig.pollingInterval, } : {}), }); }$$`,
}

const contents = ({ preContent, configOverrides }) => {
  const finalConfig = deepMerge(defaultWagmiConfig, configOverrides[0] || {});

  return `import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig, { DEFAULT_ALCHEMY_API_KEY, ScaffoldConfig } from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";
${preContent[0] || ''}

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const wagmiConfig = createConfig(${stringify(finalConfig)});
`;
};

export default withDefaults(contents, {
  preContent: "",
  configOverrides: {},
});
