import { ContractAbi, ContractName } from "~~/utils/scaffold-eth/contract";
import { ExtractAbiEventNames } from "abitype";
import { useProvider, useContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ethers } from "ethers";
import { useEffect, useState } from 'react';

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
}: {
  contractName: TContractName;
  eventName: TEventName;
  fromBlock: number;
  filters?: any;
  blockData?: boolean;
  transactionData?: boolean;
  receiptData?: boolean;
}) => {
  const [events, setEvents] = useState(<any>[]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const provider = useProvider();

  const contract = useContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    signerOrProvider: provider,
  });

  useEffect(() => {
    async function readEvents() {
      if (!contract) {
        console.log("contract not found");
        return;
      }
      try {
        const fragment = contract.interface.getEvent(eventName);
        if (!fragment) {
          console.log("event not found");
          return;
        }

        const emptyIface = new ethers.utils.Interface([])
        const topicHash = emptyIface.getEventTopic(fragment)
        const topics = <any>[topicHash];

        const indexedParameters = fragment.inputs.filter((input) => input.indexed);

        if (indexedParameters.length > 0 && filters) {
          const indexedTopics = indexedParameters.map((input) => {
            const value = filters[input.name];
            if (value === undefined) {
              return null;
            }
            if (Array.isArray(value)) {
              return value.map((v) => ethers.utils.hexZeroPad(ethers.utils.hexlify(v), 32));
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
        for (let i = 0; i < logs.length; i++) {
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
          }
          newEvents.push(log);
        }
        setEvents(newEvents.reverse());
        setIsLoading(false);
      }
      catch (e) {
        console.log(e);
      }
    }
    if (!deployedContractLoading) {
      readEvents();
    }
  }, [provider, fromBlock, contractName, eventName, deployedContractData?.address, contract]);

  return {
    data: events,
    isLoading: isLoading,
  };
};
