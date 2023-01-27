import type { NextPage } from "next";
import { useState } from "react";
import { TxValueInput } from "~~/components/scaffold-eth/Contract/utilsComponents";
import { getParsedEthersError } from "~~/components/scaffold-eth/Contract/utilsContract";
import { displayTxResult } from "~~/components/scaffold-eth/Contract/utilsDisplay";
import Spinner from "~~/components/Spinner";
import { useScaffoldContractRead, useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
import { toast } from "~~/utils/scaffold-eth";

const DemoExample: NextPage = () => {
  const [txValue, setTxValue] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const writeTxn = useTransactor();

  const { data, isLoading, refetch } = useScaffoldContractRead("YourContract", "purpose");

  const { writeAsync, isLoading: isWriteLoading } = useScaffoldContractWrite(
    "YourContract",
    "setPurpose",
    [newPurpose],
    txValue,
  );

  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
      <h1 className="text-4xl my-5">Demo Example UI</h1>
      <h2>Current Purpose</h2>
      {isLoading ? <Spinner /> : <p>{displayTxResult(data)}</p>}
      <button
        disabled={isLoading}
        className="btn btn-primary"
        onClick={async () => {
          console.log("Refetching...");
          await refetch();
        }}
      >
        Refetch
      </button>
      <div className="divider" />
      <div className="space-y-3 mt-4">
        <h2 className="text-center">Set New Purpose</h2>
        <div className="flex items-end border-2 bg-base-200 rounded-full text-primary justify-between pr-3 border-base-300">
          <input
            placeholder="Set Purpose"
            autoComplete="off"
            className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
            value={newPurpose}
            onChange={e => setNewPurpose(e.target.value)}
          />
        </div>
        <TxValueInput setTxValue={setTxValue} txValue={txValue} />
        <button
          disabled={isWriteLoading}
          className="btn btn-primary"
          onClick={async () => {
            if (writeAsync && writeTxn) {
              try {
                await writeTxn(writeAsync());
              } catch (e: any) {
                const message = getParsedEthersError(e);
                toast.error(message);
              }
            }
          }}
        >
          Set New purpose
        </button>
      </div>
    </div>
  );
};

export default DemoExample;
