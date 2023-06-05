import { Abi, ExtractAbiEventNames } from "abitype";
import { useContractEvent } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { AbiEventArgs, ContractAbi, ContractName, UseScaffoldEventConfig } from "~~/utils/scaffold-eth/contract";

/**
 * @dev wrapper for wagmi's useContractEvent
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.listener - the callback that receives event
 * @param config.once - if set to true it will receive only a single event, then stop listening for the event. Defaults to false
 */
export const useScaffoldEventSubscriber = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TEventInputs extends AbiEventArgs<ContractAbi<TContractName>, TEventName> & any[],
>({
  contractName,
  eventName,
  listener,
  once,
}: UseScaffoldEventConfig<TContractName, TEventName, TEventInputs>) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  return useContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    chainId: getTargetNetwork().id,
    listener: listener as (...args: unknown[]) => void,
    eventName: eventName as string,
    once: once ?? false,
  });
};
