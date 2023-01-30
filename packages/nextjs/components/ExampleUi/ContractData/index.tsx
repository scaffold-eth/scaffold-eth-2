import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

const MARQUEE_PERIOD_IN_SEC = 5;

export const ContractData = () => {
  const [currentPurpose] = useState("This is your purpose");
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isRightDirection, setIsRightDirection] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const purposeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transitionEnabled && containerRef.current && purposeRef.current) {
      setMarqueeSpeed(
        Math.max(purposeRef.current.clientWidth, containerRef.current.clientWidth) / MARQUEE_PERIOD_IN_SEC,
      );
    }
  }, [transitionEnabled, containerRef, purposeRef]);

  return (
    <div className="flex justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] px-32">
      <div className="flex flex-col bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full">
        <div className="flex justify-between w-full">
          <button
            className="btn btn-circle btn-ghost relative bg-center bg-[url('/assets/switch-button-on.png')] bg-no-repeat"
            onClick={() => {
              setTransitionEnabled(!transitionEnabled);
            }}
          >
            <div
              className={`absolute inset-0 bg-center bg-no-repeat bg-[url('/assets/switch-button-off.png')] transition-opacity ${
                transitionEnabled ? "opacity-0" : "opacity-100"
              }`}
            />
          </button>
          <div className="bg-secondary border border-black rounded-xl flex">
            <div className="p-2 py-1 border-r border-black flex items-end">Total count</div>
            <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end">3</div>
          </div>
        </div>

        <div className="mt-3 border border-black bg-neutral rounded-3xl py-8 px-4 text-secondary  overflow-hidden text-8xl whitespace-nowrap w-full leading-tight">
          <div className="relative" ref={containerRef}>
            {/* for speed calculating purposes */}
            <div className="absolute -left-[9999rem]" ref={purposeRef}>
              {currentPurpose}
            </div>
            <Marquee
              key="1"
              direction={isRightDirection ? "right" : "left"}
              gradient={false}
              play={transitionEnabled}
              speed={marqueeSpeed}
            >
              {currentPurpose}
            </Marquee>
            <Marquee
              key="2"
              direction={isRightDirection ? "left" : "right"}
              gradient={false}
              play={transitionEnabled}
              speed={marqueeSpeed}
            >
              {currentPurpose}
            </Marquee>
            <Marquee
              key="3"
              direction={isRightDirection ? "right" : "left"}
              gradient={false}
              play={transitionEnabled}
              speed={marqueeSpeed}
            >
              {currentPurpose}
            </Marquee>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <button
            className={`btn btn-circle btn-ghost border border-black hover:border-black w-12 h-12 p-1 bg-neutral flex items-center ${
              isRightDirection ? "justify-start" : "justify-end"
            }`}
            onClick={() => {
              if (transitionEnabled) {
                setIsRightDirection(!isRightDirection);
              }
            }}
          >
            <div className="border border-black rounded-full bg-secondary w-2 h-2" />
          </button>
          <div
            className={`w-44 p-0.5 flex items-center bg-neutral border border-black rounded-full ${
              transitionEnabled && isRightDirection ? "rotate-180" : ""
            }`}
          >
            <div
              className="h-1.5 border border-black rounded-full bg-secondary animate-grow"
              style={{ animationPlayState: transitionEnabled ? "running" : "paused" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
