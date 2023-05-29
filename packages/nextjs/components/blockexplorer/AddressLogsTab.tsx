import { ethers } from "ethers";
import { useContractLogs } from "~~/hooks/scaffold-eth";

type AddressLogsTabProps = {
  address: string;
  provider: ethers.providers.Provider;
};

export const AddressLogsTab = ({ address, provider }: AddressLogsTabProps) => {
  const logs = useContractLogs(address, provider);
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
