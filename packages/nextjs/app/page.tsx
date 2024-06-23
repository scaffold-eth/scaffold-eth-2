"use client";

import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth/useScaffoldEventHistory";

const Home: NextPage = () => {
  const { data: eventHistory } = useScaffoldEventHistory({
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
                {eventHistory?.map((event, index) => (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <td>
                      <Address address={event?.args.greetingSetter} />
                    </td>
                    <td>{event?.args.newGreeting}</td>
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
