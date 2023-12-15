import { Account, Address, Chain, Transport, getContract } from "viem";
import { PublicClient, usePublicClient } from "wagmi";
import { GetWalletClientResult } from "wagmi/actions";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * Gets an instance of contract for the given contract name. Optional walletClient can be passed for doing write transactions.
 * @param config - The config settings for the hook
 * @param config.contractName - deployed contract name
 * @param config.walletClient - optional walletClient from wagmi useWalletClient hook can be passed for doing write transactions
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
