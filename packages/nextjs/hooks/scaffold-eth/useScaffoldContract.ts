import { Account, Address, Transport, getContract } from "viem";
import { Chain, PublicClient, usePublicClient } from "wagmi";
import { GetWalletClientResult } from "wagmi/actions";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * Gets a deployed contract by contract name and returns a contract instance
 * @param config - The config settings
 * @param config.contractName - Deployed contract name
 * @param config.proxyContractName - Deployed proxy contract name if you wish to use an address other than the one associated with the contractName (optional)
 * @param config.walletClient - An viem wallet client instance (optional)
 */
export const useScaffoldContract = <
  TContractName extends ContractName,
  TWalletClient extends Exclude<GetWalletClientResult, null> | undefined,
>({
  contractName,
  proxyContractName,
  walletClient,
}: {
  contractName: TContractName;
  proxyContractName?: TContractName;
  walletClient?: TWalletClient | null;
}) => {
  // If no proxy is given then we default to the given contractName
  if (!proxyContractName) {
    proxyContractName = contractName;
  }
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const { data: proxyContractData, isLoading: proxyContractLoading } = useDeployedContractInfo(proxyContractName);
  const publicClient = usePublicClient();

  let contract = undefined;
  if (deployedContractData && proxyContractData) {
    contract = getContract<
      Transport,
      Address,
      Contract<TContractName>["abi"],
      Chain,
      Account,
      PublicClient,
      TWalletClient
    >({
      address: proxyContractData.address,
      abi: deployedContractData.abi as Contract<TContractName>["abi"],
      walletClient: walletClient ? walletClient : undefined,
      publicClient,
    });
  }

  return {
    data: contract,
    isLoading: deployedContractLoading && proxyContractLoading,
  };
};
