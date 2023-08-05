import type { ExtractAbiFunctionNames } from "abitype";
import { useContractRead } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import {
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  UseScaffoldReadConfig,
} from "~~/utils/scaffold-eth/contract";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.proxyContractName - Deployed proxy contract name if you wish to use an address other than the one associated with the contractName (optional)
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 */
export const useScaffoldContractRead = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>({
  contractName,
  proxyContractName,
  functionName,
  args,
  ...readConfig
}: UseScaffoldReadConfig<TContractName, TFunctionName>) => {
  // If no proxy is given then we default to the given contractName
  if (!proxyContractName) {
    proxyContractName = contractName;
  }
  const { data: deployedContract } = useDeployedContractInfo(contractName);
  const { data: proxyContract } = useDeployedContractInfo(proxyContractName);

  return useContractRead({
    chainId: getTargetNetwork().id,
    functionName,
    address: proxyContract?.address,
    abi: deployedContract?.abi,
    watch: true,
    args,
    enabled: !Array.isArray(args) || !args.some(arg => arg === undefined),
    ...(readConfig as any),
  }) as Omit<ReturnType<typeof useContractRead>, "data" | "refetch"> & {
    data: AbiFunctionReturnType<ContractAbi, TFunctionName> | undefined;
    refetch: (options?: {
      throwOnError: boolean;
      cancelRefetch: boolean;
    }) => Promise<AbiFunctionReturnType<ContractAbi, TFunctionName>>;
  };
};
