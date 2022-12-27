import { Network } from "@ethersproject/networks";

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

export function getNetworkColor(chainName: string | undefined) {
  switch (chainName?.toLowerCase()) {
    case "hardhat":
      return "text-yellow-600/70";
    case "homestead":
      return "text-red-600/70";
    case "mumbai":
      return "text-violet-600/70";
    case "goerli":
      return "text-blue-600/70";

    default:
      return "text-primary";
  }
}
