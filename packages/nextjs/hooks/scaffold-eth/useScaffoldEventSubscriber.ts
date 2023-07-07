import { Abi, ExtractAbiEventNames } from "abitype";
import { Log } from "viem";
import { useContractEvent } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldEventConfig } from "~~/utils/scaffold-eth/contract";

/**
 * @dev wrapper for wagmi's useContractEvent
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.listener - the callback that receives events. If only interested in 1 event, call `unwatch` inside of the listener
 */
export const useScaffoldEventSubscriber = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>({
  contractName,
  eventName,
  listener,
}: UseScaffoldEventConfig<TContractName, TEventName>) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  return useContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    chainId: getTargetNetwork().id,
    listener: listener as (logs: Log[]) => void,
    eventName,
  });
};
