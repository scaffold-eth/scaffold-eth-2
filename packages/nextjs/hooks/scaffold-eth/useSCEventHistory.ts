import { useCallback, useEffect, useMemo, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Abi, AbiEvent, ExtractAbiEventNames } from "abitype";
import { useInterval } from "usehooks-ts";
import { BlockNumber, GetLogsParameters, Hash } from "viem";
import * as chains from "viem/chains";
import { Config, UsePublicClientReturnType, useBlockNumber, usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { replacer } from "~~/utils/scaffold-eth/common";
import {
  ContractAbi,
  ContractName,
  UseScaffoldEventHistoryConfig,
  UseScaffoldEventHistoryData,
} from "~~/utils/scaffold-eth/contract";

const getLogs = async (
  getLogsParams: GetLogsParameters<AbiEvent | undefined, AbiEvent[] | undefined, boolean, BlockNumber, BlockNumber>,
  publicClient?: UsePublicClientReturnType<Config, number>,
) => {
  const logs = await publicClient?.getLogs({
    address: getLogsParams.address,
    fromBlock: getLogsParams.fromBlock,
    args: getLogsParams.args,
    event: getLogsParams.event,
  });

  return logs;
};

/**
 * Reads events from a deployed contract
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.fromBlock - the block number to start reading events from
 * @param config.filters - filters to be applied to the event (parameterName: value)
 * @param config.blockData - if set to true it will return the block data for each event (default: false)
 * @param config.transactionData - if set to true it will return the transaction data for each event (default: false)
 * @param config.receiptData - if set to true it will return the receipt data for each event (default: false)
 * @param config.watch - if set to true, the events will be updated every pollingInterval milliseconds set at scaffoldConfig (default: false)
 * @param config.enabled - set this to false to disable the hook from running (default: true)
 */
export const useSCEventHistory = <
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
  watch,
  enabled = true,
}: UseScaffoldEventHistoryConfig<TContractName, TEventName, TBlockData, TTransactionData, TReceiptData>) => {
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({
    chainId: targetNetwork.id,
  });
  const [isFirstRender, setIsFirstRender] = useState(true);

  const { data: blockNumber } = useBlockNumber({ watch: watch, chainId: targetNetwork.id });

  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  const event =
    deployedContractData &&
    ((deployedContractData.abi as Abi).find(part => part.type === "event" && part.name === eventName) as AbiEvent);

  const query = useInfiniteQuery({
    queryKey: [
      "eventHistory",
      {
        contractName,
        address: deployedContractData?.address,
        eventName,
        fromBlock: fromBlock.toString(),
        chainId: targetNetwork.id,
      },
    ],
    queryFn: async ({ pageParam }) => {
      if (!Boolean(deployedContractData?.address) || !Boolean(publicClient)) return undefined;
      const data = await getLogs(
        { address: deployedContractData?.address, event, fromBlock: pageParam, args: filters },
        publicClient,
      );

      return data;
    },
    enabled: enabled && Boolean(deployedContractData?.address) && Boolean(publicClient),
    initialPageParam: fromBlock,
    getNextPageParam: () => {
      return blockNumber;
    },
  });

  useEffect(() => {
    if (!blockNumber) return;
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    if (!watch) return;
    query.fetchNextPage();
  }, [blockNumber]);

  return query;
};

export const addIndexedArgsToEvent = (event: any) => {
  if (event.args && !Array.isArray(event.args)) {
    return { ...event, args: { ...event.args, ...Object.values(event.args) } };
  }

  return event;
};

/* return useQuery({
    queryKey: ["eventHistory", { contractName, eventName, fromBlock: fromBlock.toString(), chainId: targetNetwork.id }],
    queryFn: async () => {
      const data = await getLogs(
        { address: deployedContractData?.address, event, fromBlock, args: filters },
        publicClient,
      );

      return data;
    },
    enabled: Boolean(deployedContractData) && Boolean(publicClient),
  }); */
