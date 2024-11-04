import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { TransactionReceipt } from "viem";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { ObjectFieldDisplay } from "~~/app/debug/_components/contract";
import { replacer } from "~~/utils/scaffold-eth/common";

export const TxReceipt = ({ txResult }: { txResult: TransactionReceipt }) => {
  const [txResultCopied, setTxResultCopied] = useState(false);

  return (
    <div className="flex text-sm peer-checked:rounded-b-none min-h-0 bg-secondary/50 py-0">
      <div className="mt-1 pl-2">
        {txResultCopied ? (
          <CheckCircleIcon className="mt-1 text-xl font-normal h-4 w-4 cursor-pointer" aria-hidden="true" />
        ) : (
          <CopyToClipboard
            text={JSON.stringify(txResult, replacer, 2)}
            onCopy={() => {
              setTxResultCopied(true);
              setTimeout(() => {
                setTxResultCopied(false);
              }, 800);
            }}
          >
            <DocumentDuplicateIcon className="mt-1 text-xl font-normal h-4 w-4 cursor-pointer" aria-hidden="true" />
          </CopyToClipboard>
        )}
      </div>
      <div className="flex-wrap collapse collapse-arrow">
        <input type="checkbox" className="min-h-0 peer" />
        <div className="collapse-title text-xs min-h-0 py-1.5 pr-0 pl-1 after:!top-4">
          <strong>Transaction Receipt</strong>
        </div>
        <div className="collapse-content overflow-auto !pl-0 pr-6">
          <pre className="text-[9px]">
            {Object.entries(txResult).map(([k, v]) => (
              <ObjectFieldDisplay name={k} value={v} size="xs" leftPad={false} key={k} />
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
