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
