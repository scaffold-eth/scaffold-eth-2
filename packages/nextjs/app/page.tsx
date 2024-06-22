"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { InputBase } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useSCEventHistory } from "~~/hooks/scaffold-eth/useSCEventHistory";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [newGreetings, setNewGreetings] = useState<string>("");

  const { data: eventHistory } = useSCEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChange",
    filters: { greetingSetter: connectedAddress },
    fromBlock: 0n,
  });

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  console.log(eventHistory?.pages.flat());

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="overflow-x-auto">
            <InputBase value={newGreetings} onChange={setNewGreetings} />
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "setGreeting",
                    args: [newGreetings],
                  });
                } catch (e) {
                  console.error("Error setting greeting:", e);
                }
              }}
            >
              Set Greeting
            </button>
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Gretting Setter</th>
                  <th>greeting</th>
                </tr>
              </thead>
              {/* <tbody>
                {eventHistory?.map((event, index) => (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <td>
                      <Address address={event.args.greetingSetter} />
                    </td>
                    <td>{event.args.newGreeting}</td>
                  </tr>
                ))}
              </tbody> */}
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
