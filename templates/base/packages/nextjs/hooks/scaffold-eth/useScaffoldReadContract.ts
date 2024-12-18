import { useEffect } from "react";
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import type { ExtractAbiFunctionNames } from "abitype";
import { ReadContractErrorType } from "viem";
import { useBlockNumber, useReadContract } from "wagmi";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import {
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  UseScaffoldReadConfig,
} from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper around wagmi's useContractRead hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 * @param config.chainId - optional chainId that is configured with the scaffold project to make use for multi-chain interactions.
 */
export const useScaffoldReadContract = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>({
  contractName,
  functionName,
  args,
  chainId,
  ...readConfig
}: UseScaffoldReadConfig<TContractName, TFunctionName>) => {
  const selectedNetwork = useSelectedNetwork(chainId);
  const { data: deployedContract } = useDeployedContractInfo({
    contractName,
    chainId: selectedNetwork.id as AllowedChainIds,
  });

  const { query: queryOptions, watch, ...readContractConfig } = readConfig;
  // set watch to true by default
  const defaultWatch = watch ?? true;

  const readContractHookRes = useReadContract({
    chainId: selectedNetwork.id,
    functionName,
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    args,
    ...(readContractConfig as any),
    query: {
      enabled: !Array.isArray(args) || !args.some(arg => arg === undefined),
      ...queryOptions,
    },
  }) as Omit<ReturnType<typeof useReadContract>, "data" | "refetch"> & {
    data: AbiFunctionReturnType<ContractAbi, TFunctionName> | undefined;
    refetch: (
      options?: RefetchOptions | undefined,
    ) => Promise<QueryObserverResult<AbiFunctionReturnType<ContractAbi, TFunctionName>, ReadContractErrorType>>;
  };

  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: defaultWatch,
    chainId: selectedNetwork.id,
    query: {
      enabled: defaultWatch,
    },
  });

  useEffect(() => {
    if (defaultWatch) {
      queryClient.invalidateQueries({ queryKey: readContractHookRes.queryKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return readContractHookRes;
};
