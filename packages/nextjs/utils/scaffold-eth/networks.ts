import * as chains from "wagmi/chains";
import { Network } from "@ethersproject/networks";

export type TChainAttributes = {
  name: string;
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string];
  id: number;
};

export const NETWORKS_EXTRA_DATA: Record<string, TChainAttributes> = {
  [chains.hardhat.id]: {
    name: "hardhat",
    color: "#b8af0c",
    id: 31337,
  },
  [chains.mainnet.id]: {
    name: "mainnet",
    color: "#ff8b9e",
    id: 1,
  },
  [chains.goerli.id]: {
    name: "goerli",
    color: "#0975F6",
    id: 5,
  },
  [chains.gnosis.id]: {
    name: "gnosis",
    color: "#48a9a6",
    id: 100,
  },
  [chains.polygon.id]: {
    name: "polygon",
    color: "#2bbdf7",
    id: 137,
  },
  [chains.polygonMumbai.id]: {
    name: "mumbai",
    color: "#92D9FA",
    id: 80001,
  },
  [chains.optimismGoerli.id]: {
    name: "goerliOptimism",
    color: "#f01a37",
    id: 420,
  },
  [chains.optimism.id]: {
    name: "optimism",
    color: "#f01a37",
    id: 10,
  },
  [chains.arbitrumGoerli.id]: {
    name: "goerliArbitrum",
    color: "#28a0f0",
    id: 421613,
  },
  [chains.arbitrum.id]: {
    name: "arbitrum",
    color: "#28a0f0",
    id: 42161,
  },
  [chains.fantom.id]: {
    name: "fantom",
    color: "#1969ff",
    id: 250,
  },
  [chains.fantomTestnet.id]: {
    name: "testnetFantom",
    color: "#1969ff",
    id: 4002,
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

/**
 * Get the wagmi's Chain target network configured in the app.
 */
export const getTargetNetwork = () => {
  const network = process.env.NEXT_PUBLIC_NETWORK as keyof typeof chains;

  if (!network || !chains[network]) {
    // If error defaults to hardhat local network
    console.error("Network name is not set, misspelled or unsupported network used in .env.*");
    return chains.hardhat;
  }

  return chains[network];
};
