import { Address } from "viem";
import { useContractLogs } from "~~/hooks/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

export const AddressLogsTab = ({ address }: { address: Address }) => {
  const contractLogs = useContractLogs(address);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="mockup-code overflow-auto max-h-[500px]">
        <pre className="px-5 whitespace-pre-wrap break-words">
          {contractLogs.map((log, i) => (
            <div key={i}>
              <strong>Log:</strong> {JSON.stringify(log, replacer, 2)}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
