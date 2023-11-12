import { useEffect, useMemo, useState } from "react";
import { Abi, AbiEvent, ExtractAbiEventNames } from "abitype";
import { Hash } from "viem";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";
import {
  ContractAbi,
  ContractName,
  UseScaffoldEventHistoryConfig,
  UseScaffoldEventHistoryData,
} from "~~/utils/scaffold-eth/contract";

/**
 * @dev reads events from a deployed contract
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.fromBlock - the block number to start reading events from
 * @param config.filters - filters to be applied to the event (parameterName: value)
 * @param config.blockData - if set to true it will return the block data for each event (default: false)
 * @param config.transactionData - if set to true it will return the transaction data for each event (default: false)
 * @param config.receiptData - if set to true it will return the receipt data for each event (default: false)
 */
export const useScaffoldEventHistory = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TBlockData extends boolean = false,
  TTransactionData extends boolean = false,
  TReceiptData extends boolean = false,
>({
  contractName,
  eventName,
  fromBlock,
  filters,
  blockData,
  transactionData,
  receiptData,
}: UseScaffoldEventHistoryConfig<TContractName, TEventName, TBlockData, TTransactionData, TReceiptData>) => {
  const [events, setEvents] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function readEvents() {
      try {
        if (!deployedContractData) {
          throw new Error("Contract not found");
        }

        const event = (deployedContractData.abi as Abi).find(
          part => part.type === "event" && part.name === eventName,
        ) as AbiEvent;

        const logs = await publicClient.getLogs({
          address: deployedContractData?.address,
          event,
          args: filters as any, // TODO: check if it works and fix type
          fromBlock,
        });
        const newEvents = [];
        for (let i = logs.length - 1; i >= 0; i--) {
          newEvents.push({
            log: logs[i],
            args: logs[i].args,
            block:
              blockData && logs[i].blockHash === null
                ? null
                : await publicClient.getBlock({ blockHash: logs[i].blockHash as Hash }),
            transaction:
              transactionData && logs[i].transactionHash !== null
                ? await publicClient.getTransaction({ hash: logs[i].transactionHash as Hash })
                : null,
            receipt:
              receiptData && logs[i].transactionHash !== null
                ? await publicClient.getTransactionReceipt({ hash: logs[i].transactionHash as Hash })
                : null,
          });
        }
        setEvents(newEvents);
        setError(undefined);
      } catch (e: any) {
        console.error(e);
        setEvents(undefined);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    }
    if (!deployedContractLoading) {
      readEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    publicClient,
    fromBlock,
    contractName,
    eventName,
    deployedContractLoading,
    deployedContractData?.address,
    deployedContractData,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(filters, replacer),
    blockData,
    transactionData,
    receiptData,
  ]);

  const eventHistoryData = useMemo(
    () =>
      events?.map(addIndexedArgsToEvent) as UseScaffoldEventHistoryData<
        TContractName,
        TEventName,
        TBlockData,
        TTransactionData,
        TReceiptData
      >,
    [events],
  );

  return {
    data: eventHistoryData,
    isLoading: isLoading,
    error: error,
  };
};

export const addIndexedArgsToEvent = (event: any) => {
  if (event.args && !Array.isArray(event.args)) {
    return { ...event, args: { ...event.args, ...Object.values(event.args) } };
  }

  return event;
};
