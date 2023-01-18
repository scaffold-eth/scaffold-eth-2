import { BigNumber } from "ethers";
import { Dispatch, SetStateAction } from "react";
import { toast } from "~~/utils/scaffold-eth";

/**
 * Input component which comes with utility buttons to handle conversion of ETH
 */
const TxValueInput = ({ setTxValue, txValue }: { setTxValue: Dispatch<SetStateAction<string>>; txValue: string }) => {
  return (
    <div className="flex items-end border-2 border-base-300 bg-base-200 rounded-full text-primary justify-between pr-3">
      <input
        placeholder="value (wei)"
        autoComplete="off"
        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
        value={txValue}
        onChange={e => setTxValue(e.target.value)}
      />
      <div className="space-x-4 flex">
        <button
          className="cursor-pointer text-xl font-semibold pt-1 text-accent"
          onClick={async () => {
            try {
              const floatValue = parseFloat(txValue);
              if (floatValue) {
                setTxValue("" + floatValue * 10 ** 18);
              } else {
                throw new Error("Invalid number");
              }
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
        >
          *
        </button>
        <button
          className="cursor-pointer text-xl font-semibold text-accent"
          onClick={async () => {
            try {
              if (!txValue) return;
              setTxValue(BigNumber.from(txValue).toHexString());
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
        >
          #
        </button>
      </div>
    </div>
  );
};

export { TxValueInput };
