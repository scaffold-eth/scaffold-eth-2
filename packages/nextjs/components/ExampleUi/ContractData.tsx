import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { BigNumber } from "ethers";

const MARQUEE_PERIOD_IN_SEC = 5;

export default function ContractData() {
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isRightDirection, setIsRightDirection] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);

  // I guess this is related to: https://github.com/scaffold-eth/se-2/issues/116
  // Ideally I'd like data to be the right type based on the function name / variable name we are calling.
  // @ts-expect-error
  const { data: totalCounter }: { data: BigNumber } = useScaffoldContractRead("YourContract", "totalCounter");
  // @ts-expect-error
  const { data: currentGreeting }: { data: string } = useScaffoldContractRead("YourContract", "greeting");

  useEffect(() => {
    if (transitionEnabled && containerRef.current && greetingRef.current) {
      setMarqueeSpeed(
        Math.max(greetingRef.current.clientWidth, containerRef.current.clientWidth) / MARQUEE_PERIOD_IN_SEC,
      );
    }
  }, [transitionEnabled, containerRef, greetingRef]);

  return (
    <div className="flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
      <div className="flex flex-col max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full">
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
          <div className="bg-secondary border border-primary rounded-xl flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">Total count</div>
            <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
              {totalCounter?.toString() || "0"}
            </div>
          </div>
        </div>

        <div className="mt-3 border border-primary bg-neutral rounded-3xl text-secondary  overflow-hidden text-[116px] whitespace-nowrap w-full uppercase tracking-tighter font-bai-jamjuree leading-tight">
          <div className="relative overflow-x-hidden" ref={containerRef}>
            {/* for speed calculating purposes */}
            <div className="absolute -left-[9999rem]" ref={greetingRef}>
              <div className="px-4">{currentGreeting}</div>
            </div>
            <Marquee
              key="1"
              direction={isRightDirection ? "right" : "left"}
              gradient={false}
              play={transitionEnabled}
              speed={marqueeSpeed}
            >
              <div className="px-4">{currentGreeting}</div>
            </Marquee>
            <Marquee
              key="2"
              direction={isRightDirection ? "left" : "right"}
              gradient={false}
              play={transitionEnabled}
              speed={marqueeSpeed}
              className="-my-10"
            >
              <div className="px-4">{currentGreeting}</div>
            </Marquee>
            <Marquee
              key="3"
              direction={isRightDirection ? "right" : "left"}
              gradient={false}
              play={transitionEnabled}
              speed={marqueeSpeed}
            >
              <div className="px-4">{currentGreeting}</div>
            </Marquee>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <button
            className={`btn btn-circle btn-ghost border border-primary hover:border-primary w-12 h-12 p-1 bg-neutral flex items-center ${
              isRightDirection ? "justify-start" : "justify-end"
            }`}
            onClick={() => {
              if (transitionEnabled) {
                setIsRightDirection(!isRightDirection);
              }
            }}
          >
            <div className="border border-primary rounded-full bg-secondary w-2 h-2" />
          </button>
          <div className="w-44 p-0.5 flex items-center bg-neutral border border-primary rounded-full">
            <div
              className="h-1.5 border border-primary rounded-full bg-secondary animate-grow"
              style={{ animationPlayState: transitionEnabled ? "running" : "paused" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
