import { useState } from "react";

export const ContractData = () => {
  const [currentPurpose] = useState("This is your purpose");
  const [isRightDirection, setIsRightDirection] = useState(true);

  return (
    <div className="flex justify-center items-center bg-gradient bg-[length:100%_100%] px-32">
      <div className="flex flex-col bg-base-200 opacity-80 rounded-2xl shadow-lg px-5 py-4 w-full">
        <div className="flex justify-between w-full">
          <button className="btn btn-circle btn-ghost bg-[url('/assets/switcher.png')] bg-center" />
          <div className="bg-secondary border border-black rounded-xl flex">
            <div className="p-2 py-1 border-r border-black flex items-end">Total count</div>
            <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end">3</div>
          </div>
        </div>

        <div className="mt-3 border border-black bg-white rounded-3xl py-8 px-4 text-secondary text-8xl overflow-hidden whitespace-nowrap w-full">
          <div key="purpose-1">{currentPurpose}</div>
          <div key="purpose-2">{currentPurpose}</div>
          <div key="purpose-3">{currentPurpose}</div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <button
            className={`btn btn-circle btn-ghost border border-black hover:border-black w-12 h-12 p-1 bg-white flex items-center ${
              isRightDirection ? "justify-end" : "justify-start"
            }`}
            onClick={() => setIsRightDirection(!isRightDirection)}
          >
            <div className="border border-black rounded-full bg-secondary w-2 h-2" />
          </button>
          <div className="h-4 px-0.5 flex items-center bg-white border border-black rounded-full">
            <progress
              className="progress progress-secondary w-40 border border-black rounded-full"
              value="10"
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
