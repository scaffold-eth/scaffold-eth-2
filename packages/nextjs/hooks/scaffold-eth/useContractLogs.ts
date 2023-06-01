import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useProvider } from "wagmi";

export const useContractLogs = (address: string) => {
  const [logs, setLogs] = useState<ethers.providers.Log[]>([]);
  const provider = useProvider();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const filter = {
          address: address,
          fromBlock: 0,
          toBlock: "latest",
        };
        const existingLogs = await provider.getLogs(filter);
        setLogs(existingLogs);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    const handleLog = (log: ethers.providers.Log) => {
      setLogs(prevLogs => [...prevLogs, log]);
    };

    const filter = { address: address };

    fetchLogs();
    provider.on(filter, handleLog);
    return () => {
      provider.off(filter, handleLog);
    };
  }, [address, provider]);

  return logs;
};
