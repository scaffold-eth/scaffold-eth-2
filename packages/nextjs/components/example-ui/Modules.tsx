import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import moduleMappings from "../ModuleMappings.json";
import {
  useAnimationConfig,
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

  //// useScaffoldEventSubscriber({
  ////   contractName: "NotaRegistrar",
  ////   eventName: "Written",
  ////   listener: logs => {
  ////     logs.map(log => {
  ////       const { caller, notaId, owner, instant, currency, escrowed, timestamp, moduleFee, module, moduleData } = log.args;
  ////       console.log("📡 Nota", caller, notaId, owner, instant, currency, escrowed, timestamp, moduleFee, module, moduleData);
  ////     });
  ////   },
  //// });
  //// useEffect(() => {
  ////   if (transitionEnabled && containerRef.current && greetingRef.current) {
  ////     setMarqueeSpeed(
  ////       Math.max(greetingRef.current.clientWidth, containerRef.current.clientWidth) / MARQUEE_PERIOD_IN_SEC,
  ////     );
  ////   }
  //// }, [transitionEnabled, containerRef, greetingRef]);  

interface NotaObject {  
  module: string;
}

export const Modules = () => {  
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isRightDirection, setIsRightDirection] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  /*
  Get their bytecode
  Have map between bytecode and module description
  */
  const {
    data: myNotaEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "NotaRegistrar",
    eventName: "Written",
    fromBlock: process.env.NEXT_PUBLIC_DEPLOY_BLOCK ? BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) : 0n,
    blockData: false,
  });

  const notas = myNotaEvents?.reduce((acc, event) => {acc.push(event.args); return acc; } , []);

  const uniqueModules = notas?.reduce((acc : any, nota: NotaObject) => {
    if (!acc.includes(nota.module)) {
      acc.push(nota.module);
    }
    return acc;
  }, []);
  console.log(uniqueModules);

  // const moduleBytecodes = uniqueModules?.map((module) => getBytecode(module));
  // console.log(moduleBytecodes);

  const showAnimation = false; //useAnimationConfig(totalCounter);
  const showTransition = false; //transitionEnabled && !!totalCounter// && !isGreetingLoading;

  const modules = JSON.parse(JSON.stringify(moduleMappings));

  return (
    <div className="grid grid-cols-3 gap-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      {Object.keys(modules).map((key) => (
        <div
            className={`max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 mx-20 py-4 w-full ${
              showAnimation ? "animate-zoom" : ""
            }`}
          >
            {/* Top half of the box */}
            <div className="flex justify-between w-full">
            <h1 className="text-center mb-0 float-bottom">
                <span className="block text-2xl">{modules[key].name}</span>
              </h1>
      
              {/* Counter box */}
              {/* <div className="bg-secondary border border-primary rounded-xl flex">
                <div className="p-2 py-1 border-r border-primary flex items-end">Total count</div>
                <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
                  {totalCounter?.toString() || "0"}
                </div>
              </div> */}
            </div>
            {/* Dividing line */}
            <div className="mt-3 border border-primary bg-neutral rounded-3xl text-secondary  overflow-hidden text-[116px] whitespace-nowrap w-full uppercase tracking-tighter font-bai-jamjuree leading-tight">
              <div className="relative overflow-x-hidden" ref={containerRef}>
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
                    </Marquee>
                  );
                })}
              </div>
            </div>
            {/* Bottom half of box */}
            <div className="mt-3 flex items-end justify-between">
            <div className="p-2 py-1 flex items-end">Description: {" "}{modules[key].description}
            </div>
            </div>     
          </div>
          ))}
    </div>
  );
};

          {/* <button
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
          </button> */}

        {/* <button
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
          </button> */}
          {/* <div className="w-44 p-0.5 flex items-center bg-neutral border border-primary rounded-full">
            <div
              className="h-1.5 border border-primary rounded-full bg-secondary animate-grow"
              style={{ animationPlayState: showTransition ? "running" : "paused" }}
            />
          </div> */}