import { Abi } from "abitype";
import { getContract } from "viem";
import { GetWalletClientResult } from "wagmi/actions";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * Gets a deployed contract by contract name and returns a contract instance
 * @param config - The config settings
 * @param config.contractName - Deployed contract name
 * @param config.proxyContractName - Deployed proxy contract name if you wish to use an address other than the one associated with the contractName (optional)
 * @param config.walletClient - An viem wallet client instance (optional)
 */
export const useScaffoldContract = <TContractName extends ContractName>({
  contractName,
  proxyContractName,
  walletClient,
}: {
  contractName: TContractName;
  proxyContractName?: TContractName;
  walletClient?: GetWalletClientResult;
}) => {
  // If no proxy is given then we default to the given contractName
  if (!proxyContractName) {
    proxyContractName = contractName;
  }
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const { data: proxyContractData, isLoading: proxyContractLoading } = useDeployedContractInfo(proxyContractName);

  // type GetWalletClientResult = WalletClient | null, hence narrowing it to undefined so that it can be passed to getContract
  const walletClientInstance = walletClient != null ? walletClient : undefined;

  let contract = undefined;
  if (deployedContractData && proxyContractData) {
    contract = getContract({
      address: proxyContractData.address,
      abi: deployedContractData.abi as Abi,
      walletClient: walletClientInstance,
    });
  }

  return {
    data: contract,
    isLoading: deployedContractLoading && proxyContractLoading,
  };
};
