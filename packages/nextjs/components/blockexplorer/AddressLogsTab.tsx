import { useEffect, useState } from "react";
import { useContractLogs } from "~~/hooks/scaffold-eth";

type AddressLogsTabProps = {
  address: string;
};

export const AddressLogsTab = ({ address }: AddressLogsTabProps) => {
  const [logs, setLogs] = useState<any[]>([]);

  const contractLogs = useContractLogs(address);

  useEffect(() => {
    setLogs(contractLogs);
  }, [contractLogs]);

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
