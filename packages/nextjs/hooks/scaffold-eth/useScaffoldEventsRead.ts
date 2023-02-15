import { useContractEvent } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

import { useDeployedContractInfo } from "./useDeployedContractInfo";

/**
 * @dev wrapper for wagmi's useContractEvent
 * @param contractName - deployed contract name
 * @param eventName - name of the event to listen for
 * @param callbackListener - the callback that receives event
 * @param once - if set to true it will receive only a single event, then stop listening for the event. Defaults to false
 */
export const useScaffoldEventsRead = (contractName: string, eventName: string, callbackListener: any, once = false) => {
  const configuredChain = getTargetNetwork();
  const deployedContractData = useDeployedContractInfo(contractName);

  return useContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    eventName,
    listener: callbackListener,

    chainId: configuredChain.id,
    once,
  });
};
