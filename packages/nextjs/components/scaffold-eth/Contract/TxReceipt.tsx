import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { tryToDisplay } from "./utilsDisplay";

const TxReceipt = (txResult: string | number | BigNumber | Record<string, any> | TransactionReceipt | undefined) => {
  return (
    <div className="flex-wrap collapse mb-2">
      <input type="checkbox" />
      <div className="collapse-title text-sm sm:text-base rounded-lg bg-secondary my-2">Transaction Receipt</div>
      <div className="collapse-content overflow-auto bg-secondary rounded-lg">
        <pre className="text-xs p-2">{tryToDisplay(txResult)}</pre>
      </div>
    </div>
  );
};

export default TxReceipt;
