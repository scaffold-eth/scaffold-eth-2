import { BigNumber } from "ethers";
import { Dispatch, SetStateAction } from "react";
import { toast } from "~~/utils/scaffold-eth";

/**
 * Input component which comes with utility buttons to handle conversion of ETH
 */
const TxValueInput = ({
  setTxValue,
  txValue,
}: {
  setTxValue: Dispatch<SetStateAction<BigNumber | undefined>>;
  txValue: BigNumber | undefined;
}) => {
  return (
    <div className="flex items-end border-2 border-base-300 bg-base-200 rounded-full text-primary justify-between pr-3">
      <input
        placeholder="value (wei)"
        autoComplete="off"
        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
        value={txValue ? BigNumber.from(txValue).toString() : ""}
        onChange={e => {
          try {
            if (!e.target.value) {
              setTxValue(undefined);
              return;
            }
            setTxValue(BigNumber.from(e.target.value));
          } catch (err) {
            toast.error("Invalid number");
          }
        }}
      />
      <div className="space-x-4 flex">
        <button
          className="cursor-pointer text-xl font-semibold pt-1 text-accent"
          onClick={async () => {
            if (!txValue) return;
            setTxValue(txValue.mul(String(10 ** 18)));
          }}
        >
          *
        </button>
      </div>
    </div>
  );
};

export { TxValueInput };
