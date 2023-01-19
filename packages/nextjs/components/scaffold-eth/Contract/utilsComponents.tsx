import { BigNumber } from "ethers";
import { Dispatch, SetStateAction, useState } from "react";
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
  const [isHex, setIsHex] = useState(false);
  const inputValue = txValue
    ? isHex
      ? BigNumber.from(txValue).toHexString()
      : BigNumber.from(txValue).toString()
    : "";

  return (
    <div className="flex items-end border-2 border-base-300 bg-base-200 rounded-full text-primary justify-between pr-3">
      <input
        placeholder="value (wei)"
        autoComplete="off"
        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
        value={inputValue}
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
        <button
          className="cursor-pointer text-xl font-semibold text-accent"
          onClick={() => {
            setIsHex(!isHex);
          }}
        >
          #
        </button>
      </div>
    </div>
  );
};

export { TxValueInput };
