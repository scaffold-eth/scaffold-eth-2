import { useTargetNetwork } from "./useTargetNetwork";
import { Address, erc20Abi, isAddress } from "viem";
import { useReadContract } from "wagmi";

export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
};

export const useToken = ({
  address,
  chainId: chainIdOverride,
  enabled = true,
}: {
  address: Address | undefined;
  chainId?: number | undefined;
  enabled?: boolean | undefined;
}): { data: Token | null; isLoading: boolean } => {
  const { targetNetwork } = useTargetNetwork();
  const chainId = chainIdOverride ?? targetNetwork.id;

  const name = useReadContract({
    chainId,
    address,
    abi: erc20Abi,
    functionName: "name",
    query: {
      enabled: Boolean(address && isAddress(address) && enabled),
    },
  });

  const symbol = useReadContract({
    chainId,
    address,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      enabled: Boolean(address && isAddress(address) && enabled),
    },
  });

  const decimals = useReadContract({
    chainId,
    address,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: Boolean(address && isAddress(address) && enabled),
    },
  });

  if (!address || !isAddress(address) || !name.data || !symbol.data || !decimals.data) {
    return { data: null, isLoading: false };
  }

  return {
    data: {
      chainId,
      address,
      name: name.data,
      symbol: symbol.data,
      decimals: decimals.data,
    },
    isLoading: name.isLoading || symbol.isLoading || decimals.isLoading,
  };
};
