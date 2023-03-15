import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { displayTxResult } from "~~/components/scaffold-eth";

export const TxReceipt = (
  txResult: string | number | BigNumber | Record<string, any> | TransactionReceipt | undefined,
) => {
  return (
    <div className="flex-wrap collapse collapse-arrow mb-2">
      <input type="checkbox" className="min-h-0 peer" />
      <div className="collapse-title text-sm rounded-3xl peer-checked:rounded-b-none min-h-0 bg-secondary py-1.5">
        <strong>Transaction Receipt</strong>
      </div>
      <div className="collapse-content overflow-auto bg-secondary rounded-t-none rounded-3xl">
        <pre className="text-xs pt-4">{displayTxResult(txResult)}</pre>
      </div>
    </div>
  );
};
