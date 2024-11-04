"use client";

import { useState } from "react";
import Link from "next/link";
import { Portal } from "../components/ApePortal";
// import { ApePortal, Bridge } from "@yuga-labs/ape-portal-public";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
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
  // const { data: currentAdvertiser } = useScaffoldReadContract({
  //   contractName: "BidBoard",
  //   functionName: "currentAdvertiser",
  // });

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
        console.error("Error updating message:", e);
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
        <div className="flex-grow bg-transparent dark:bg-primary w-full flex items-center justify-evenly flex-col">
          <div className="flex flex-col md:flex-row justify-center items-center mt-5 gap-6 md:gap-12 w-full md:w-4/6 px-4 py-12">
            <div className="flex flex-col w-full md:w-96 justify-center py-6">
              <input
                type="text"
                className="block w-full bg-transparent mb-3 md:mb-5 rounded border-0 py-1.5 pl-7 pr-20 ring-2 ring-inset ring-accent dark:ring-base-200 placeholder:text-gray-400 dark:placeholder:text-base-content focus:ring-2 focus:ring-inset focus:ring-base-300 dark:focus:ring-base-300 sm:text-sm sm:leading-6"
                placeholder="Enter your message"
                onChange={e => setnewMessage(e.target.value)}
              />
              <input
                type="text"
                className="block w-full bg-transparent mb-3 md:mb-5 rounded border-0 py-1.5 pl-7 pr-20 ring-2 ring-inset ring-accent dark:ring-base-200 placeholder:text-gray-400 dark:placeholder:text-base-content focus:ring-2 focus:ring-inset focus:ring-base-300 dark:focus:ring-base-300 sm:text-sm sm:leading-6"
                placeholder="Enter new price"
                onChange={e => setNewPrice(e.target.value)}
              />
              <button
                onClick={() => submitBid()}
                className="bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-neutral dark:hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-base-300 focus:ring-opacity-50"
              >
                Submit
              </button>
            </div>
            <div className="bg-gradient-holographic w-full md:w-3/6 h-60 p-1 rounded">
              <div className="bg-ape-radial bg-cover bg-center w-full h-full rounded">
                <div className="bg-primary bg-opacity-75 w-full h-full flex flex-col items-center justify-evenly p-6 rounded">
                  <p>{`"${message}"`}</p>
                  <div className="flex justify-between w-full">
                    <h5>
                      Current price: <br /> {formatedAmount.toFixed(1)} ETH
                    </h5>
                    <h5>
                      Top bidder:
                      {/* <Address address={currentAdvertiser} /> */}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center md:text-left">
            Explore your ApeChain transactions with the{" "}
            <Link href="https://curtis.explorer.caldera.xyz/" passHref className="link">
              Block Explorer
            </Link>{" "}
          </p>
        </div>
        <Portal />
      </div>
    </>
  );
};

export default Home;
