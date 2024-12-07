import { Account, Address, Chain, Client, Transport, getContract } from "viem";
import { usePublicClient } from "wagmi";
import { GetWalletClientReturnType } from "wagmi/actions";
import { useAllowedNetwork } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * Gets a viem instance of the contract present in deployedContracts.ts or externalContracts.ts corresponding to
 * targetNetworks configured in scaffold.config.ts. Optional walletClient can be passed for doing write transactions.
 * @param config - The config settings for the hook
 * @param config.contractName - deployed contract name
 * @param config.walletClient - optional walletClient from wagmi useWalletClient hook can be passed for doing write transactions
 */
export const useScaffoldContract = <
  TContractName extends ContractName,
  TWalletClient extends Exclude<GetWalletClientReturnType, null> | undefined,
>({
  contractName,
  walletClient,
  chainId,
}: {
  contractName: TContractName;
  walletClient?: TWalletClient | null;
  chainId?: AllowedChainIds;
}) => {
  const selectedNetwork = useAllowedNetwork(chainId as AllowedChainIds);
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo({
    contractName,
    chainId: selectedNetwork?.id as AllowedChainIds,
  });

  const publicClient = usePublicClient({ chainId: selectedNetwork?.id });

  let contract = undefined;
  if (deployedContractData && publicClient) {
    contract = getContract<
      Transport,
      Address,
      Contract<TContractName>["abi"],
      TWalletClient extends Exclude<GetWalletClientReturnType, null>
        ? {
            public: Client<Transport, Chain>;
            wallet: TWalletClient;
          }
        : { public: Client<Transport, Chain> },
      Chain,
      Account
    >({
      address: deployedContractData.address,
      abi: deployedContractData.abi as Contract<TContractName>["abi"],
      client: {
        public: publicClient,
        wallet: walletClient ? walletClient : undefined,
      } as any,
    });
  }

  return {
    data: contract,
    isLoading: deployedContractLoading,
  };
};
