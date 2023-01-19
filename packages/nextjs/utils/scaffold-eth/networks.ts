import { Network } from "@ethersproject/networks";

type TChainAttributes = {
  name: string;
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string];
  chainId: number;
};

export const NETWORKS: Record<string, TChainAttributes> = {
  localhost: {
    name: "localhost",
    color: ["#666666", "#bbbbbb"],
    chainId: 31337,
  },
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    chainId: 1,
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    chainId: 5,
  },
  gnosis: {
    name: "gnosis",
    color: "#48a9a6",
    chainId: 100,
  },
  polygon: {
    name: "polygon",
    color: "#2bbdf7",
    chainId: 137,
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    chainId: 80001,
  },
  localOptimismL1: {
    name: "localOptimismL1",
    color: "#f01a37",
    chainId: 31337,
  },
  localOptimism: {
    name: "localOptimism",
    color: "#f01a37",
    chainId: 420,
  },
  goerliOptimism: {
    name: "goerliOptimism",
    color: "#f01a37",
    chainId: 420,
  },
  optimism: {
    name: "optimism",
    color: "#f01a37",
    chainId: 10,
  },
  goerliArbitrum: {
    name: "goerliArbitrum",
    color: "#28a0f0",
    chainId: 421613,
  },
  arbitrum: {
    name: "arbitrum",
    color: "#28a0f0",
    chainId: 42161,
  },
  devnetArbitrum: {
    name: "devnetArbitrum",
    color: "#28a0f0",
    chainId: 421612,
  },
  localAvalanche: {
    name: "localAvalanche",
    color: ["#666666", "#bbbbbb"],
    chainId: 43112,
  },
  fujiAvalanche: {
    name: "fujiAvalanche",
    color: ["#666666", "#bbbbbb"],
    chainId: 43113,
  },
  mainnetAvalanche: {
    name: "mainnetAvalanche",
    color: ["#666666", "#bbbbbb"],
    chainId: 43114,
  },
  testnetHarmony: {
    name: "testnetHarmony",
    color: "#00b0ef",
    chainId: 1666700000,
  },
  mainnetHarmony: {
    name: "mainnetHarmony",
    color: "#00b0ef",
    chainId: 1666600000,
  },
  fantom: {
    name: "fantom",
    color: "#1969ff",
    chainId: 250,
  },
  testnetFantom: {
    name: "testnetFantom",
    color: "#1969ff",
    chainId: 4002,
  },
  moonbeam: {
    name: "moonbeam",
    color: "#53CBC9",
    chainId: 1284,
  },
  moonriver: {
    name: "moonriver",
    color: "#53CBC9",
    chainId: 1285,
  },
  moonbaseAlpha: {
    name: "moonbaseAlpha",
    color: "#53CBC9",
    chainId: 1287,
  },
  moonbeamDevNode: {
    name: "moonbeamDevNode",
    color: "#53CBC9",
    chainId: 1281,
  },
};

/**
 * Gives the block explorer transaction URL.
 * @param network
 * @param txnHash
 * @dev returns empty string if the network is localChain
 */
export function getBlockExplorerTxLink(network: Network, txnHash: string) {
  const { name, chainId } = network;

  if (chainId === 31337 || chainId === 1337) {
    // If its localChain then return empty sting
    return "";
  }

  let blockExplorerNetwork = "";
  if (name && chainId > 1) {
    blockExplorerNetwork = name + ".";
  }

  let blockExplorerBaseTxUrl = "https://" + blockExplorerNetwork + "etherscan.io/tx/";
  if (chainId === 100) {
    blockExplorerBaseTxUrl = "https://blockscout.com/poa/xdai/tx/";
  }

  const blockExplorerTxURL = blockExplorerBaseTxUrl + txnHash;

  return blockExplorerTxURL;
}

export const getNetworkDetailsByChainId = (chainId: number) =>
  Object.values(NETWORKS).find(val => val.chainId === chainId);
