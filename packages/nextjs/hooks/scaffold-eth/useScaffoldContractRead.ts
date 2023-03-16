import { useContractRead } from "wagmi";
import type { ExtractAbiFunctionNames } from "abitype";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { AbiFunctionArguments, AbiFunctionReturnType, ContractAbi, ContractName } from "./contract.types";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param args - args to be passed to the function call
 * @param readConfig - extra wagmi configuration
 */
export const useScaffoldContractRead = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>(
  contractName: TContractName,
  functionName: TFunctionName,
  args?: AbiFunctionArguments<ContractAbi<TContractName>, TFunctionName>,
  readConfig?: Parameters<typeof useContractRead>[0],
) => {
  const configuredChain = getTargetNetwork();
  const { data: deployedContract } = useDeployedContractInfo(contractName);

  return useContractRead({
    chainId: configuredChain.id,
    functionName,
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    watch: true,
    args: args as unknown[],
    ...readConfig,
  }) as Omit<ReturnType<typeof useContractRead>, "data" | "refetch"> & {
    data: AbiFunctionReturnType<ContractAbi, TFunctionName>;
    refetch: (options?: {
      throwOnError: boolean;
      cancelRefetch: boolean;
    }) => Promise<AbiFunctionReturnType<ContractAbi, TFunctionName>>;
  };
};
