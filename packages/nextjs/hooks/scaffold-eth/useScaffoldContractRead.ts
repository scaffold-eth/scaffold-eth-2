import type { Abi } from "abitype";
import { useContractRead } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param args - args to be passed to the function call
 * @param readConfig - extra wagmi configuration
 */
export const useScaffoldContractRead = <TReturn = any>(
  contractName: string,
  functionName: string,
  args?: any[],
  readConfig?: Parameters<typeof useContractRead>[0],
) => {
  const configuredChain = getTargetNetwork();
  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  return useContractRead({
    chainId: configuredChain.id,
    functionName,
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    watch: true,
    args,
    ...readConfig,
  }) as Omit<ReturnType<typeof useContractRead>, "data"> & {
    data: TReturn;
  };
};
