import { Network } from "@ethersproject/networks";

export type TChainAttributes = {
  name: string;
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string];
  id: number;
};

export const NETWORKS: Record<string, TChainAttributes> = {
  hardhat: {
    name: "hardhat",
    color: ["#666666", "#bbbbbb"],
    id: 31337,
  },
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    id: 1,
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    id: 5,
  },
  gnosis: {
    name: "gnosis",
    color: "#48a9a6",
    id: 100,
  },
  polygon: {
    name: "polygon",
    color: "#2bbdf7",
    id: 137,
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    id: 80001,
  },
  localOptimismL1: {
    name: "localOptimismL1",
    color: "#f01a37",
    id: 31337,
  },
  localOptimism: {
    name: "localOptimism",
    color: "#f01a37",
    id: 420,
  },
  goerliOptimism: {
    name: "goerliOptimism",
    color: "#f01a37",
    id: 420,
  },
  optimism: {
    name: "optimism",
    color: "#f01a37",
    id: 10,
  },
  goerliArbitrum: {
    name: "goerliArbitrum",
    color: "#28a0f0",
    id: 421613,
  },
  arbitrum: {
    name: "arbitrum",
    color: "#28a0f0",
    id: 42161,
  },
  devnetArbitrum: {
    name: "devnetArbitrum",
    color: "#28a0f0",
    id: 421612,
  },
  localAvalanche: {
    name: "localAvalanche",
    color: ["#666666", "#bbbbbb"],
    id: 43112,
  },
  fujiAvalanche: {
    name: "fujiAvalanche",
    color: ["#666666", "#bbbbbb"],
    id: 43113,
  },
  mainnetAvalanche: {
    name: "mainnetAvalanche",
    color: ["#666666", "#bbbbbb"],
    id: 43114,
  },
  testnetHarmony: {
    name: "testnetHarmony",
    color: "#00b0ef",
    id: 1666700000,
  },
  mainnetHarmony: {
    name: "mainnetHarmony",
    color: "#00b0ef",
    id: 1666600000,
  },
  fantom: {
    name: "fantom",
    color: "#1969ff",
    id: 250,
  },
  testnetFantom: {
    name: "testnetFantom",
    color: "#1969ff",
    id: 4002,
  },
  moonbeam: {
    name: "moonbeam",
    color: "#53CBC9",
    id: 1284,
  },
  moonriver: {
    name: "moonriver",
    color: "#53CBC9",
    id: 1285,
  },
  moonbaseAlpha: {
    name: "moonbaseAlpha",
    color: "#53CBC9",
    id: 1287,
  },
  moonbeamDevNode: {
    name: "moonbeamDevNode",
    color: "#53CBC9",
    id: 1281,
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

export const getNetworkDetailsByChainId = (id: number) => Object.values(NETWORKS).find(val => val.id === id);

/**
 * @dev Returns the target network metadata or defaults to hardhat if the network is unsupported/undefined
 */
export const getTargetNetwork = () => {
  const network = process.env.NEXT_PUBLIC_NETWORK;

  if (!network || !NETWORKS[network]) {
    // If error defaults to hardhat local network
    console.error("Network name misspelled or unsupported network used in process.env");
    const hardhatChain = NETWORKS["hardhat"];
    return hardhatChain;
  }

  return NETWORKS[network];
};
