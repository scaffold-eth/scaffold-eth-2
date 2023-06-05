import { useEffect, useState } from "react";
import { Abi, ExtractAbiEventNames } from "abitype";
import { ethers } from "ethers";
import { useContract, useProvider } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldEventHistoryConfig } from "~~/utils/scaffold-eth/contract";

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
>({
  contractName,
  eventName,
  fromBlock,
  filters,
  blockData,
  transactionData,
  receiptData,
}: UseScaffoldEventHistoryConfig<TContractName, TEventName>) => {
  const [events, setEvents] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const provider = useProvider();

  const contract = useContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    signerOrProvider: provider,
  });

  useEffect(() => {
    async function readEvents() {
      try {
        if (!deployedContractData || !contract) {
          throw new Error("Contract not found");
        }

        const fragment = contract.interface.getEvent(eventName);
        const emptyIface = new ethers.utils.Interface([]);
        const topicHash = emptyIface.getEventTopic(fragment);
        const topics = [topicHash] as any[];

        const indexedParameters = fragment.inputs.filter(input => input.indexed);

        if (indexedParameters.length > 0 && filters) {
          const indexedTopics = indexedParameters.map(input => {
            const value = (filters as any)[input.name];
            if (value === undefined) {
              return null;
            }
            if (Array.isArray(value)) {
              return value.map(v => ethers.utils.hexZeroPad(ethers.utils.hexlify(v), 32));
            }
            return ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32);
          });
          topics.push(...indexedTopics);
        }

        const logs = await provider.getLogs({
          address: deployedContractData?.address,
          topics: topics,
          fromBlock: fromBlock,
        });
        const newEvents = [];
        for (let i = logs.length - 1; i >= 0; i--) {
          let block;
          if (blockData) {
            block = await provider.getBlock(logs[i].blockHash);
          }
          let transaction;
          if (transactionData) {
            transaction = await provider.getTransaction(logs[i].transactionHash);
          }
          let receipt;
          if (receiptData) {
            receipt = await provider.getTransactionReceipt(logs[i].transactionHash);
          }
          const log = {
            log: logs[i],
            args: contract.interface.parseLog(logs[i]).args,
            block: block,
            transaction: transaction,
            receipt: receipt,
          };
          newEvents.push(log);
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
    provider,
    fromBlock,
    contractName,
    eventName,
    deployedContractLoading,
    deployedContractData?.address,
    contract,
    deployedContractData,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(filters),
    blockData,
    transactionData,
    receiptData,
  ]);

  return {
    data: events,
    isLoading: isLoading,
    error: error,
  };
};
