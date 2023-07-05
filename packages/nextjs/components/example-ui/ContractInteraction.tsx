import { useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { ArrowSmallRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const [visible, setVisible] = useState(true);
  const [newGreeting, setNewGreeting] = useState("");

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "setGreeting",
    args: [newGreeting],
    value: "0.01",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  return (
    <div className="relative flex bg-base-300 pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute left-36 bottom-0" />
      <HareIcon className="absolute right-0 bottom-24" />
      <div className="mx-5 flex w-full flex-col sm:mx-8 2xl:mx-20">
        <div className={`mt-10 flex gap-2 ${visible ? "" : "invisible"} max-w-2xl`}>
          <div className="z-0 flex gap-5 rounded-2xl bg-base-200 bg-opacity-80 p-7 shadow-lg">
            <span className="text-3xl">👋🏻</span>
            <div>
              <div>
                In this page you can see how some of our <strong>hooks & components</strong> work, and how you can bring
                them to life with your own design! Have fun and try it out!
              </div>
              <div className="mt-2">
                Check out{" "}
                <code className="bg-base-300 text-base font-bold italic [word-spacing:-0.5rem]">
                  packages / nextjs/pages / example-ui.tsx
                </code>{" "}
                and its underlying components.
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-circle z-0 h-6 min-h-0 w-6 bg-base-200 bg-opacity-80 drop-shadow-md"
            onClick={() => setVisible(false)}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col rounded-2xl border-2 border-primary bg-base-200 px-7 py-8 opacity-80 shadow-lg">
          <span className="sm:text-6xlx text-4xl text-black">Set a Greeting_</span>

          <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-5">
            <input
              type="text"
              placeholder="Write your greeting here"
              className="input w-full border border-primary bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] px-5 font-bai-jamjuree text-lg uppercase placeholder-white sm:text-2xl"
              onChange={e => setNewGreeting(e.target.value)}
            />
            <div className="flex flex-shrink-0 rounded-full border border-primary p-1">
              <div className="flex rounded-full border-2 border-primary p-1">
                <button
                  className={`font-white btn btn-primary flex w-24 items-center gap-1 rounded-full font-normal capitalize tracking-widest transition-all hover:gap-2 ${
                    isLoading ? "loading" : ""
                  }`}
                  onClick={() => writeAsync()}
                >
                  {!isLoading && (
                    <>
                      Send <ArrowSmallRightIcon className="mt-0.5 h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <span className="text-sm leading-tight">Price:</span>
            <div className="badge badge-warning">0.01 ETH + Gas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
