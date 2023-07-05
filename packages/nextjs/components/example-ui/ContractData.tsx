import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useAccount } from "wagmi";
import {
  useAnimationConfig,
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

const MARQUEE_PERIOD_IN_SEC = 5;

export const ContractData = () => {
  const { address } = useAccount();
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isRightDirection, setIsRightDirection] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);

  const { data: totalCounter } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "totalCounter",
  });

  const { data: currentGreeting, isLoading: isGreetingLoading } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "greeting",
  });

  useScaffoldEventSubscriber({
    contractName: "YourContract",
    eventName: "GreetingChange",
    listener: logs => {
      logs.map(log => {
        const { greetingSetter, value, premium, newGreeting } = log.args;
        console.log("📡 GreetingChange event", greetingSetter, value, premium, newGreeting);
      });
    },
  });

  const {
    data: myGreetingChangeEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChange",
    fromBlock: process.env.NEXT_PUBLIC_DEPLOY_BLOCK ? BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) : 0n,
    filters: { greetingSetter: address },
    blockData: true,
  });

  console.log("Events:", isLoadingEvents, errorReadingEvents, myGreetingChangeEvents);

  const { data: yourContract } = useScaffoldContract({ contractName: "YourContract" });
  console.log("yourContract: ", yourContract);

  const { showAnimation } = useAnimationConfig(totalCounter);

  const showTransition = transitionEnabled && !!currentGreeting && !isGreetingLoading;

  useEffect(() => {
    if (transitionEnabled && containerRef.current && greetingRef.current) {
      setMarqueeSpeed(
        Math.max(greetingRef.current.clientWidth, containerRef.current.clientWidth) / MARQUEE_PERIOD_IN_SEC,
      );
    }
  }, [transitionEnabled, containerRef, greetingRef]);

  return (
    <div className="lg:py-auto flex max-w-[100vw] flex-col items-center justify-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 ">
      <div
        className={`flex w-full max-w-md flex-col rounded-2xl bg-base-200 bg-opacity-70 px-5 py-4 shadow-lg ${
          showAnimation ? "animate-zoom" : ""
        }`}
      >
        <div className="flex w-full justify-between">
          <button
            className="btn btn-ghost btn-circle relative bg-[url('/assets/switch-button-on.png')] bg-center bg-no-repeat"
            onClick={() => {
              setTransitionEnabled(!transitionEnabled);
            }}
          >
            <div
              className={`absolute inset-0 bg-[url('/assets/switch-button-off.png')] bg-center bg-no-repeat transition-opacity ${
                transitionEnabled ? "opacity-0" : "opacity-100"
              }`}
            />
          </button>
          <div className="flex rounded-xl border border-primary bg-secondary">
            <div className="flex items-end border-r border-primary p-2 py-1">Total count</div>
            <div className="flex min-w-[3rem] justify-end px-2 py-1 text-right font-bai-jamjuree text-4xl">
              {totalCounter?.toString() || "0"}
            </div>
          </div>
        </div>

        <div className="mt-3 w-full overflow-hidden whitespace-nowrap rounded-3xl border  border-primary bg-neutral font-bai-jamjuree text-[116px] uppercase leading-tight tracking-tighter text-secondary">
          <div className="relative overflow-x-hidden" ref={containerRef}>
            {/* for speed calculating purposes */}
            <div className="absolute -left-[9999rem]" ref={greetingRef}>
              <div className="px-4">{currentGreeting}</div>
            </div>
            {new Array(3).fill("").map((_, i) => {
              const isLineRightDirection = i % 2 ? isRightDirection : !isRightDirection;
              return (
                <Marquee
                  key={i}
                  direction={isLineRightDirection ? "right" : "left"}
                  gradient={false}
                  play={showTransition}
                  speed={marqueeSpeed}
                  className={i % 2 ? "-my-10" : ""}
                >
                  <div className="px-4">{currentGreeting || " "}</div>
                </Marquee>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <button
            className={`btn btn-ghost btn-circle flex h-12 w-12 items-center border border-primary bg-neutral p-1 hover:border-primary ${
              isRightDirection ? "justify-start" : "justify-end"
            }`}
            onClick={() => {
              if (transitionEnabled) {
                setIsRightDirection(!isRightDirection);
              }
            }}
          >
            <div className="h-2 w-2 rounded-full border border-primary bg-secondary" />
          </button>
          <div className="flex w-44 items-center rounded-full border border-primary bg-neutral p-0.5">
            <div
              className="h-1.5 animate-grow rounded-full border border-primary bg-secondary"
              style={{ animationPlayState: showTransition ? "running" : "paused" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
