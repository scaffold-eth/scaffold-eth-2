import { BigNumber } from "ethers";
import { Dispatch, SetStateAction } from "react";

/**
 * Input component which comes with utility buttons to handle conversion of ETH
 */
const TxValueInput = ({ setTxValue, txValue }: { setTxValue: Dispatch<SetStateAction<string>>; txValue: string }) => {
  return (
    <div className="flex items-end border-2 border-gray-100 bg-base-200 rounded-xl text-primary/90 justify-between pr-3">
      <input
        placeholder="Value"
        autoComplete="off"
        className="input input-ghost focus:outline-none focus:bg-transparent h-[2.2rem] min-h-[2.2rem] placeholder:text-primary/90 border w-full font-medium"
        value={txValue}
        onChange={e => setTxValue(e.target.value)}
      />
      <div className="space-x-4 flex">
        <button
          className="cursor-pointer text-xl font-semibold pt-1"
          onClick={async () => {
            if (!txValue) return;
            const floatValue = parseFloat(txValue);
            if (floatValue) setTxValue("" + floatValue * 10 ** 18);
          }}
        >
          *
        </button>
        <button
          className="cursor-pointer text-xl font-semibold"
          onClick={async () => {
            if (!txValue) return;
            setTxValue(BigNumber.from(txValue).toHexString());
          }}
        >
          #
        </button>
      </div>
    </div>
  );
};

export { TxValueInput };
