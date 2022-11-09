import { BigNumber } from "ethers";
import { Dispatch, SetStateAction } from "react";

/**
 * Input component which comes with utility buttons to handle conversion of ETH
 */
const TxValueInput = ({ setTxValue, txValue }: { setTxValue: Dispatch<SetStateAction<string>>; txValue: string }) => {
  return (
    <div className="flex space-x-2 items-center">
      <input
        placeholder="Value"
        autoComplete="off"
        className="input input-sm"
        value={txValue}
        onChange={e => setTxValue(e.target.value)}
      />
      <button
        style={{ cursor: "pointer" }}
        onClick={async () => {
          if (!txValue) return;

          const floatValue = parseFloat(txValue);
          if (floatValue) setTxValue("" + floatValue * 10 ** 18);
        }}
      >
        ✴️
      </button>
      <button
        style={{ cursor: "pointer" }}
        onClick={async () => {
          if (!txValue) return;
          setTxValue(BigNumber.from(txValue).toHexString());
        }}
      >
        #️⃣
      </button>
    </div>
  );
};

export { TxValueInput };
