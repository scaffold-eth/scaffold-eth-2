import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { localhost } from "wagmi/chains";
import { useContractLogs } from "~~/hooks/scaffold-eth";
import { getLocalProvider } from "~~/utils/scaffold-eth";

type AddressLogsTabProps = {
  address: string;
};

const provider = getLocalProvider(localhost) || new ethers.providers.JsonRpcProvider("http://localhost:8545");

export const AddressLogsTab = ({ address }: AddressLogsTabProps) => {
  const [logs, setLogs] = useState<any[]>([]);

  const contractLogs = useContractLogs(address, provider);

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
