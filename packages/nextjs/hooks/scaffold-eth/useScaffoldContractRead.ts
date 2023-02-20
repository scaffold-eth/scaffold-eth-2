import { useContractRead } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { Abi, AbiParametersToPrimitiveTypes, ExtractAbiFunctionNames, ExtractAbiFunction } from "abitype";
import contracts from "../../generated/hardhat_contracts";

const TARGET_NETWORK: keyof typeof contracts = "31337";

type AbiReturnParameters<TAbi extends Abi, TFunctionName extends string> = ExtractAbiFunction<
  TAbi,
  TFunctionName
>["outputs"];

type AbiReturnType<TAbi extends Abi, TFunctionName extends string> = AbiParametersToPrimitiveTypes<
  AbiReturnParameters<TAbi, TFunctionName>
>[0];

type TContractAbi<TContractName extends keyof typeof contracts[typeof TARGET_NETWORK][0]["contracts"]> =
  typeof contracts[typeof TARGET_NETWORK][0]["contracts"][TContractName]["abi"];

/**
 * Wrapper for wagmi's useContractRead hook which loads a deployed contract ABI & Address automatically
 *
 * @param contractName - generated contract data
 * @param functionName - name of the function to be called
 * @param readConfig   - wagmi configurations
 */
export const useScaffoldContractRead = <
  TContractName extends keyof typeof contracts[typeof TARGET_NETWORK][0]["contracts"],
  TFunctionName extends ExtractAbiFunctionNames<TContractAbi<TContractName>>,
>(
  contractName: TContractName,
  functionName: TFunctionName,
  readConfig?: Parameters<typeof useContractRead>[0],
) => {
  const configuredChain = getTargetNetwork();

  return useContractRead({
    chainId: configuredChain.id,
    functionName,
    address: contracts[TARGET_NETWORK][0].contracts[contractName].address,
    abi: contracts[TARGET_NETWORK][0].contracts[contractName].abi,
    watch: true,
    ...readConfig,
  }) as Omit<ReturnType<typeof useContractRead>, "data" | "refetch"> & {
    data: AbiReturnType<TContractAbi<TContractName>, TFunctionName>;
    refetch: (options?: {
      throwOnError: boolean;
      cancelRefetch: boolean;
    }) => Promise<AbiReturnType<TContractAbi<TContractName>, TFunctionName>>;
  };
};
