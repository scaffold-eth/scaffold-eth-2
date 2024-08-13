"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { Address as Addresss, formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("BidBoard");

  const [newMessage, setnewMessage] = useState("");
  const [newPrice, setNewPrice] = useState("0");
  const { data: message } = useScaffoldReadContract({
    contractName: "BidBoard",
    functionName: "message",
  });
  const { data: currentAdvertiser } = useScaffoldReadContract({
    contractName: "BidBoard",
    functionName: "currentAdvertiser",
  });

  const { data: currentAmount } = useScaffoldReadContract({
    contractName: "BidBoard",
    functionName: "currentAmount",
  });

  const submitBid = async () => {
    if (newMessage && newPrice) {
      try {
        await writeYourContractAsync({
          functionName: "updateMessage",
          args: [newMessage],
          value: parseEther(newPrice),
        });
      } catch (e) {
        console.error("Error setting greeting:", e);
      }
    }
  };
  const formatedAmount = currentAmount ? Number(formatEther(currentAmount)) : 0;

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2 + ApeChain</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full items-center justify-center flex  ">
          <div className="flex justify-center items-center gap-12 flex-col w-4/6">
            <div className=" w-full flex justify-between ">
              <div className="flex flex-col w-96 justify-center ">
                <input
                  type="text"
                  className="block w-full bg-transparent mb-5 rounded-md border-0 py-1.5 pl-7 pr-20 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter your message"
                  onChange={e => setnewMessage(e.target.value)}
                />
                <input
                  type="text"
                  className="block w-full bg-transparent mb-5 rounded-md border-0 py-1.5 pl-7 pr-20 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter new price"
                  onChange={e => setNewPrice(e.target.value)}
                />
                <button
                  onClick={() => submitBid()}
                  className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Submit
                </button>
              </div>
              <div className="border w-3/6 h-60 flex flex-col items-center justify-evenly p-3 rounded ">
                <p>{`"${message}"`}</p>
                <div className="flex justify-between w-full ">
                  <h5>
                    current price: <br /> {formatedAmount.toFixed(1)}
                    ETH
                  </h5>
                  <h5>
                    Top bidder:
                    <Address address={currentAdvertiser} />
                  </h5>
                </div>
              </div>
            </div>
            <p>
              Explore your ApeChain transactions with the{" "}
              <Link href="https://curtis.explorer.caldera.xyz/" passHref className="link">
                Block Explorer
              </Link>{" "}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
