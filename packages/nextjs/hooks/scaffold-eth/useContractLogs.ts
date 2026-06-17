import { useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Address, Log } from "viem";
import { usePublicClient } from "wagmi";

export const useContractLogs = (address: Address) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const { targetNetwork } = useTargetNetwork();
  const client = usePublicClient({ chainId: targetNetwork.id });

  useEffect(() => {
    setLogs([]);
    let unwatch: (() => void) | undefined;
    let lastFetchedBlock = 0n;
    // Set to true on effect cleanup. Guards against in-flight fetchLogs completing after
    // unmount or re-run (e.g. React Strict Mode, address/client change) and registering
    // a duplicate watcher or calling setLogs with stale data.
    let ignore = false;

    const fetchLogs = async () => {
      if (!client) return console.error("Client not found");
      try {
        const latestBlock = await client.getBlockNumber();
        if (ignore) return;

        const existingLogs = await client.getLogs({
          address: address,
          fromBlock: 0n,
          toBlock: latestBlock,
        });
        if (ignore) return;

        lastFetchedBlock = latestBlock;
        setLogs(existingLogs);

        unwatch = client.watchBlockNumber({
          onBlockNumber: async blockNumber => {
            const fromBlock = lastFetchedBlock + 1n;
            if (fromBlock > blockNumber) return;

            // Advance cursor before await so concurrent block callbacks don't overlap
            lastFetchedBlock = blockNumber;

            try {
              const newLogs = await client.getLogs({
                address: address,
                fromBlock: fromBlock,
                toBlock: blockNumber,
              });
              if (ignore) return;

              if (newLogs.length > 0) {
                setLogs(prevLogs => [...prevLogs, ...newLogs]);
              }
            } catch (error) {
              // Roll back the cursor so the next block callback retries this range
              lastFetchedBlock = fromBlock - 1n;
              console.error("Failed to fetch logs:", error);
            }
          },
        });
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchLogs();

    return () => {
      ignore = true;
      unwatch?.();
    };
  }, [address, client]);

  return logs;
};
