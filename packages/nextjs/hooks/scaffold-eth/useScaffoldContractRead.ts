import { useContractRead } from "wagmi";
import type { Abi } from "abitype";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param readConfig   - wagmi configurations
 */
export const useScaffoldContractRead = (
  contractName: string,
  functionName: string,
  readConfig?: Parameters<typeof useContractRead>[0],
) => {
  const configuredChain = getTargetNetwork();
  const deployedContractData = useDeployedContractInfo({ contractName });

  return useContractRead({
    chainId: configuredChain.id,
    functionName,
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    watch: true,
    ...readConfig,
  });
};
