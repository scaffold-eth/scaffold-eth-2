import { useTargetNetwork } from "./useTargetNetwork";
import { blo } from "blo";
import { Address as AddressType, Chain, getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";

type UseAddressOptions = {
  address?: AddressType;
  chain?: Chain;
};

export function getBlockExplorerAddressLink(network: Chain, address: string) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;

  if (!blockExplorerBaseURL) {
    return `https://etherscan.io/address/${address}`;
  }

  return `${blockExplorerBaseURL}/address/${address}`;
}

// make the chain optional, if not provided, it will use from wagmi conig
export const useAddress = ({ address, chain }: UseAddressOptions) => {
  const checkSumAddress = address ? getAddress(address) : undefined;

  const { data: ens, isLoading: isEnsNameLoading } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: isAddress(checkSumAddress ?? ""),
    },
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ens ? normalize(ens) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(ens),
      gcTime: 30_000,
    },
  });

  const shortAddress = checkSumAddress ? `${checkSumAddress.slice(0, 6)}...${checkSumAddress.slice(-4)}` : undefined;

  const isValidAddress = checkSumAddress ? isAddress(checkSumAddress) : false;
  const blockExplorerAddressLink = chain ? getBlockExplorerAddressLink(chain, checkSumAddress ?? "") : "";

  return {
    checkSumAddress,
    ens,
    ensAvatar,
    isEnsNameLoading,
    blockExplorerAddressLink,
    isValidAddress,
    shortAddress,
    blockieUrl: address ? blo(address as `0x${string}`) : undefined,
  };
};
