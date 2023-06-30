import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { displayTxResult } from "~~/components/scaffold-eth";

export const TxReceipt = (
  txResult: string | number | BigNumber | Record<string, any> | TransactionReceipt | undefined,
) => {
  return (
    <div className="collapse collapse-arrow mb-2 flex-wrap">
      <input type="checkbox" className="peer min-h-0" />
      <div className="collapse-title min-h-0 rounded-3xl bg-secondary py-1.5 text-sm peer-checked:rounded-b-none">
        <strong>Transaction Receipt</strong>
      </div>
      <div className="collapse-content overflow-auto rounded-3xl rounded-t-none bg-secondary">
        <pre className="pt-4 text-xs">{displayTxResult(txResult)}</pre>
      </div>
    </div>
  );
};
