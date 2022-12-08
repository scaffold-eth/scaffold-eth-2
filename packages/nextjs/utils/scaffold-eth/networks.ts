import { Network } from "@ethersproject/networks";

export function getBlockExplorerTxLink(network: Network, txnHash: string) {
  const { name, chainId } = network;

  if (chainId === 31337 || chainId === 13337) {
    // If its localChain then return empty sting
    return "";
  }

  let etherscanNetwork = "";
  if (name && chainId && chainId > 1) {
    etherscanNetwork = name + ".";
  }

  let etherscanBaseTxUrl = "https://" + etherscanNetwork + "etherscan.io/tx/";
  if (chainId && chainId === 100) {
    etherscanBaseTxUrl = "https://blockscout.com/poa/xdai/tx/";
  }

  const etherscanTxnURL = etherscanBaseTxUrl + txnHash;

  return etherscanTxnURL;
}
