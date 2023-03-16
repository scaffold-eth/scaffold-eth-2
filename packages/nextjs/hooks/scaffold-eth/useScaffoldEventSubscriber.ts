import { Abi, ExtractAbiEventNames } from "abitype";
import { useContractEvent } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { AbiEventArgs, ContractAbi, ContractName } from "./contract.types";

/**
 * @dev wrapper for wagmi's useContractEvent
 * @param contractName - deployed contract name
 * @param eventName - name of the event to listen for
 * @param callbackListener - the callback that receives event
 * @param once - if set to true it will receive only a single event, then stop listening for the event. Defaults to false
 */
export const useScaffoldEventSubscriber = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TEventInputs extends AbiEventArgs<ContractAbi<TContractName>, TEventName> & any[],
>(
  contractName: TContractName,
  eventName: TEventName,
  callbackListener: (...args: TEventInputs) => void,
  once = false,
) => {
  const configuredChain = getTargetNetwork();
  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  return useContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    chainId: configuredChain.id,
    listener: callbackListener as (...args: unknown[]) => void,
    eventName: eventName as string,
    once,
  });
};
