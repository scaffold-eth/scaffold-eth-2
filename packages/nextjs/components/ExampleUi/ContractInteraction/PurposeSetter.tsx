import { useState } from "react";
import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";
import { useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
import { getParsedEthersError } from "~~/components/scaffold-eth/Contract/utilsContract";
import { toast } from "~~/utils/scaffold-eth";

export const PurposeSetter = () => {
  const [newPurpose, setNewPurpose] = useState("");

  // Could we move useTransactor inside useScaffoldContractWrite?
  const writeTxn = useTransactor();
  const { writeAsync, isLoading } = useScaffoldContractWrite(
    "YourContract",
    "setPurpose",
    [newPurpose],
    // Since this hook is going to be "high-level" maybe we should accept the value in ETH (not wei)?
    // Passing "0.01" seems more high-level-dx-friendly.
    "10000000000000000",
  );

  return (
    <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
      <span className="text-4xl sm:text-6xl text-black">Set a Purpose_</span>

      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
        <input
          type="text"
          placeholder="Write your purpose here"
          className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
          onChange={e => setNewPurpose(e.target.value)}
        />
        <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
          <div className="flex rounded-full border-2 border-primary p-1">
            <button
              className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${
                isLoading ? "loading" : ""
              }`}
              onClick={async () => {
                if (writeAsync && writeTxn) {
                  try {
                    // If the contract is not deployed this "works". I get a "mined successfully" msg.
                    await writeTxn(writeAsync());
                  } catch (e: any) {
                    const message = getParsedEthersError(e);
                    toast.error(message);
                  }
                }
              }}
            >
              {!isLoading && (
                <>
                  Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 items-start">
        <span className="text-sm leading-tight">Price:</span>
        <div className="badge badge-warning">0.01 ETH + Gas</div>
      </div>
    </div>
  );
};
