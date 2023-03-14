import * as chains from "wagmi/chains";
import { Network } from "@ethersproject/networks";

export type TChainAttributes = {
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string];
};

export const NETWORKS_EXTRA_DATA: Record<string, TChainAttributes> = {
  [chains.hardhat.id]: {
    color: "#b8af0c",
  },
  [chains.mainnet.id]: {
    color: "#ff8b9e",
  },
  [chains.sepolia.id]: {
    color: ["#5f4bb6", "#87ff65"],
  },
  [chains.goerli.id]: {
    color: "#0975F6",
  },
  [chains.gnosis.id]: {
    color: "#48a9a6",
  },
  [chains.polygon.id]: {
    color: "#2bbdf7",
  },
  [chains.polygonMumbai.id]: {
    color: "#92D9FA",
  },
  [chains.optimismGoerli.id]: {
    color: "#f01a37",
  },
  [chains.optimism.id]: {
    color: "#f01a37",
  },
  [chains.arbitrumGoerli.id]: {
    color: "#28a0f0",
  },
  [chains.arbitrum.id]: {
    color: "#28a0f0",
  },
  [chains.fantom.id]: {
    color: "#1969ff",
  },
  [chains.fantomTestnet.id]: {
    color: "#1969ff",
  },
};

/**
 * Gives the block explorer transaction URL.
 * @param network
 * @param txnHash
 * @dev returns empty string if the network is localChain
 */
export const getBlockExplorerTxLink = (network: Network, txnHash: string) => {
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
};

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
