import { Network } from "@ethersproject/networks";

export function getBlockExplorerTxLink(network: Network) {
  const { name, chainId } = network;
  let etherscanNetwork = "";
  if (name && chainId && chainId > 1) {
    etherscanNetwork = name + ".";
  }

  let etherscanTxUrl = "https://" + etherscanNetwork + "etherscan.io/tx";
  if (chainId && chainId === 100) {
    etherscanTxUrl = "https://blockscout.com/poa/xdai/tx";
  }

  return etherscanTxUrl;
}
