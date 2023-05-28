import { Abi } from "abitype";
import { getContract } from "viem";
import { GetWalletClientResult } from "wagmi/actions";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * Gets a deployed contract by contract name and returns a contract instance
 * @param config - The config settings
 * @param config.contractName - Deployed contract name
 * @param config.walletClient - An viem wallet client instance (optional)
 */
export const useScaffoldContract = <TContractName extends ContractName>({
  contractName,
  walletClient,
}: {
  contractName: TContractName;
  walletClient?: GetWalletClientResult;
}) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);

  // type GetWalletClientResult = WalletClient | null, hence narrowing it to undefined so that it can be passed to getContract
  const walletClientInstance = walletClient != null ? walletClient : undefined;

  let contract = undefined;
  if (deployedContractData) {
    contract = getContract({
      address: deployedContractData.address,
      abi: deployedContractData.abi as Abi,
      walletClient: walletClientInstance,
    });
  }

  return {
    data: contract,
    isLoading: deployedContractLoading,
  };
};
