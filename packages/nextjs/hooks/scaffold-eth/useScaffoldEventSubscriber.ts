import { AbiEventArgs, ContractAbi, ContractName } from "./contract.types";
import { Abi, ExtractAbiEventNames } from "abitype";
import { useContractEvent } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

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
}: {
  contractName: TContractName;
  eventName: TEventName;
  listener: (...args: TEventInputs) => void;
  once?: boolean;
}) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  return useContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    chainId: scaffoldConfig.targetNetwork.id,
    listener: listener as (...args: unknown[]) => void,
    eventName: eventName as string,
    once: once ?? false,
  });
};
