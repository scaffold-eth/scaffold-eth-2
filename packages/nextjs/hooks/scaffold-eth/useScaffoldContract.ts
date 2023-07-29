import { getContract } from "viem";
import { usePublicClient } from "wagmi";
import { GetWalletClientResult } from "wagmi/actions";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

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
  const publicClient = usePublicClient();

  let contract = undefined;
  if (deployedContractData) {
    contract = getContract({
      address: deployedContractData.address,
      abi: deployedContractData.abi as Contract<TContractName>["abi"],
      walletClient: walletClient ? walletClient : undefined,
      publicClient,
    });
  }

  return {
    data: contract,
    isLoading: deployedContractLoading,
  };
};
