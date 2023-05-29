import { useEffect, useState } from "react";
import { ethers } from "ethers";

export const useContractLogs = (address: string, provider: ethers.providers.Provider): ethers.providers.Log[] => {
  const [logs, setLogs] = useState<ethers.providers.Log[]>([]);

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
    provider.on(filter, handleLog);

    fetchLogs();

    return () => {
      provider.off(filter, handleLog);
    };
  }, [address, provider]);

  return logs;
};
