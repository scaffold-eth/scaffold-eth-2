import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { tryToDisplay } from "./utilsDisplay";

const TxReceipt = (txResult: string | number | BigNumber | Record<string, any> | TransactionReceipt | undefined) => {
  return (
    <div className="flex-wrap collapse mb-2">
      <input type="checkbox" className="min-h-0" />
      <div className="collapse-title text-sm rounded-3xl min-h-0 bg-secondary my-2 py-2">
        <strong>Transaction Receipt</strong>
      </div>
      <div className="collapse-content overflow-auto bg-secondary rounded-3xl">
        <pre className="text-xs pt-4">{tryToDisplay(txResult)}</pre>
      </div>
    </div>
  );
};

export default TxReceipt;
