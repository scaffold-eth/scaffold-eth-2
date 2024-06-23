"use client";

import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth/useScaffoldEventHistory";

const Home: NextPage = () => {
  const {
    data: eventHistory,
    status,
    isFetchingNewEvent,
  } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChange",
    fromBlock: 4738147n,
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Gretting Setter</th>
                  <th>greeting</th>
                </tr>
              </thead>
              <tbody>
                {status === "pending" && (
                  <tr className="animate-pulse">
                    <th>
                      <span className="loading loading-dots loading-xs"></span>
                    </th>
                    <td>
                      <span className="loading loading-dots loading-xs"></span>
                    </td>
                    <td>
                      <span className="loading loading-dots loading-xs"></span>
                    </td>
                  </tr>
                )}
                {eventHistory?.map((event, index) => (
                  <tr key={index}>
                    <th className={`${isFetchingNewEvent ? "animate-pulse opacity-80" : ""}`}>{index + 1}</th>
                    <td className={`${isFetchingNewEvent ? "animate-pulse opacity-80" : ""}`}>
                      <Address address={event?.args.greetingSetter} />
                    </td>
                    <td className={`${isFetchingNewEvent ? "animate-pulse opacity-80" : ""}`}>
                      {event?.args.newGreeting}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
