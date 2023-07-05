import { Address } from "viem";
import { useContractLogs } from "~~/hooks/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

export const AddressLogsTab = ({ address }: { address: Address }) => {
  const contractLogs = useContractLogs(address);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="mockup-code max-h-[500px] overflow-auto">
        <pre className="whitespace-pre-wrap break-words px-5">
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
