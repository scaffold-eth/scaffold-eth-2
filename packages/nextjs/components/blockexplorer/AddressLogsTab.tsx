import { useEffect, useState } from "react";
import { ethers } from "ethers";

type AddressLogsTabProps = {
  address: string;
  provider: ethers.providers.Provider;
};

export const AddressLogsTab = ({ address, provider }: AddressLogsTabProps) => {
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

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="mockup-code overflow-auto max-h-[500px]">
        <pre className="px-5 whitespace-pre-wrap break-words">
          {logs.map((log, i) => (
            <div key={i}>
              <strong>Log:</strong> {JSON.stringify(log, null, 2)}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default AddressLogsTab;
