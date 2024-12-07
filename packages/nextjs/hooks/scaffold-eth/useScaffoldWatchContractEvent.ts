import { useTargetNetwork } from "./useTargetNetwork";
import { Abi, ExtractAbiEventNames } from "abitype";
import { Log } from "viem";
import { useWatchContractEvent } from "wagmi";
import { addIndexedArgsToEvent, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldEventConfig } from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper around wagmi's useEventSubscriber hook which automatically loads (by name) the contract ABI and
 * address from the contracts present in deployedContracts.ts & externalContracts.ts
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.onLogs - the callback that receives events.
 */
export const useScaffoldWatchContractEvent = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>({
  contractName,
  eventName,
  chain,
  onLogs,
}: UseScaffoldEventConfig<TContractName, TEventName>) => {
  const { targetNetwork } = useTargetNetwork();
  const selectedChain = chain ?? targetNetwork;
  const { data: deployedContractData } = useDeployedContractInfo({ contractName, chain: selectedChain });

  const addIndexedArgsToLogs = (logs: Log[]) => logs.map(addIndexedArgsToEvent);
  const listenerWithIndexedArgs = (logs: Log[]) => onLogs(addIndexedArgsToLogs(logs) as Parameters<typeof onLogs>[0]);

  return useWatchContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    chainId: selectedChain.id,
    onLogs: listenerWithIndexedArgs,
    eventName,
  });
};
