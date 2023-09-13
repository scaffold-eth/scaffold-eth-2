import { Account, Address, Transport, getContract } from "viem";
import { Chain, PublicClient, usePublicClient } from "wagmi";
import { GetWalletClientResult } from "wagmi/actions";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * Gets a deployed contract by contract name and returns a contract instance
 * @param config - The config settings
 * @param config.contractName - Deployed contract name
 * @param config.walletClient - An viem wallet client instance (optional)
 */
export const useScaffoldContract = <
  TContractName extends ContractName,
  TWalletClient extends Exclude<GetWalletClientResult, null> | undefined,
>({
  contractName,
  walletClient,
}: {
  contractName: TContractName;
  walletClient?: TWalletClient | null;
}) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const publicClient = usePublicClient();

  let contract = undefined;
  if (deployedContractData) {
    contract = getContract<
      Transport,
      Address,
      Contract<TContractName>["abi"],
      Chain,
      Account,
      PublicClient,
      TWalletClient
    >({
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
