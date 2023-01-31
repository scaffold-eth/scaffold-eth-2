import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { getDeployedContract } from "~~/components/scaffold-eth/Contract/utilsContract";
import { parseTxnValue } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractWrite hook(with config prepared by usePrepareContractWrite hook) which loads in deployed contract abi and address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param args - arguments for the function
 * @param value - value that will be sent with transaction
 */
export const useScaffoldContractWrite = (contractName: string, functionName: string, args?: any[], value?: string) => {
  const { chain } = useNetwork();
  const deployedContractData = getDeployedContract(chain?.id.toString(), contractName);
  const { config } = usePrepareContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    args,
    functionName,
    overrides: {
      value: value ? parseTxnValue(value) : undefined,
    },
  });

  return useContractWrite(config);
};
