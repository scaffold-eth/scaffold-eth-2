import { useEffect, useRef, useState } from "react";
import { useInterval } from "usehooks-ts";

export const ContractData = () => {
  const [currentPurpose] = useState("This is your purpose");
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isRightDirection, setIsRightDirection] = useState(true);
  const [directionChangedManually, setDirectionChangedManually] = useState(false);
  const [purposeRelativeWidth, setPurposeRelativeWidth] = useState(100);

  const containerRef = useRef<HTMLDivElement>(null);
  const purposeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transitionEnabled && containerRef.current && purposeRef.current) {
      setPurposeRelativeWidth(
        (purposeRef.current.clientWidth - containerRef.current.clientWidth) / containerRef.current.clientWidth,
      );
    }
  }, [transitionEnabled, containerRef, purposeRef]);

  useEffect(() => {
    if (transitionEnabled) {
      setIsRightDirection(!isRightDirection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionEnabled]);

  useInterval(
    () => {
      setIsRightDirection(!isRightDirection);
    },
    transitionEnabled && !directionChangedManually ? 3000 : null,
  );

  return (
    <div className="flex justify-center items-center bg-gradient bg-[length:100%_100%] px-32">
      <div className="flex flex-col bg-base-200 opacity-80 rounded-2xl shadow-lg px-5 py-4 w-full">
        <div className="flex justify-between w-full">
          <button
            className="btn btn-circle btn-ghost bg-[url('/assets/switcher.png')] bg-center"
            onClick={() => {
              setTransitionEnabled(!transitionEnabled);
            }}
          />
          <div className="bg-secondary border border-black rounded-xl flex">
            <div className="p-2 py-1 border-r border-black flex items-end">Total count</div>
            <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end">3</div>
          </div>
        </div>

        <div className="mt-3 border border-black bg-white rounded-3xl py-8 px-4 text-secondary text-8xl overflow-hidden whitespace-nowrap w-full">
          <div ref={containerRef} key="purpose-1" className="relative h-24">
            <div
              ref={purposeRef}
              className="absolute top-0 bottom-0 ease-linear transition-all duration-2000"
              style={{ left: isRightDirection ? "0" : `${-purposeRelativeWidth * 100}%` }}
            >
              {currentPurpose}
            </div>
          </div>
          <div key="purpose-2" className="relative h-24">
            <div
              className="absolute top-0 bottom-0 transition-all ease-linear duration-2000"
              style={{ right: isRightDirection ? "0" : `${-purposeRelativeWidth * 100}%` }}
            >
              {currentPurpose}
            </div>
          </div>
          <div key="purpose-3" className="relative h-24">
            <div
              className="absolute top-0 bottom-0 transition-all ease-linear duration-2000"
              style={{ left: isRightDirection ? "0" : `${-purposeRelativeWidth * 100}%` }}
            >
              {currentPurpose}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <button
            className={`btn btn-circle btn-ghost border border-black hover:border-black w-12 h-12 p-1 bg-white flex items-center ${
              isRightDirection ? "justify-start" : "justify-end"
            }`}
            onClick={() => {
              if (transitionEnabled) {
                setIsRightDirection(!isRightDirection);
              }
              setDirectionChangedManually(true);
            }}
          >
            <div className="border border-black rounded-full bg-secondary w-2 h-2" />
          </button>
          <div className="h-4 w-44 px-0.5 flex items-center bg-white border border-black rounded-full">
            <div
              className={`h-2 border-black rounded-full bg-secondary transition-all ease-linear duration-2000 ${
                isRightDirection ? "w-4" : "w-full"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
