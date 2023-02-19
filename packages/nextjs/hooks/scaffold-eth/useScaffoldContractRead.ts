import { useContractRead } from "wagmi";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

type GeneratedContract<TAbi> = {
  readonly address: string;
  readonly abi: TAbi;
};

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param contractData - generated contract data
 * @param functionName - name of the function to be called
 * @param readConfig   - wagmi configurations
 */
export const useScaffoldContractRead = <TAbi extends Abi>(
  contractData: GeneratedContract<TAbi>,
  functionName: ExtractAbiFunctionNames<TAbi>,
  readConfig?: Parameters<typeof useContractRead>[0],
) => {
  const configuredChain = getTargetNetwork();

  return useContractRead({
    chainId: configuredChain.id,
    functionName,
    address: contractData.address,
    abi: contractData.abi,
    watch: true,
    ...readConfig,
  });
};
