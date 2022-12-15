import type { NextPage } from "next";
import Head from "next/head";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";
import { toast } from "~~/utils";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">scaffold-eth 2</span>
        </h1>
        <p className="text-center text-lg">
          Get started by editing{" "}
          <code className="italic bg-secondary text-base font-bold">packages/nextjs/pages/index.tsx</code>
        </p>
        <p className="text-center text-lg">
          Edit your smart contract <code className="italic bg-secondary text-base font-bold">YourContract.sol</code> in{" "}
          <code className="italic bg-secondary text-base font-bold">packages/hardhat/contracts</code>
        </p>
        {/* TODO REMOVE THIS BEFORE MERGING */}
        <button
          className="btn btn-primary"
          onClick={() => {
            toast.loading("Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit excepturi libero officiis.");
            toast.info("Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit excepturi libero officiis.");
            toast.warning("Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit excepturi libero officiis.");
            toast.error("Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit excepturi libero officiis.");
            toast.success("Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit excepturi libero officiis.");
            toast.success(
              <div className="flex flex-col">
                <h1 className="font-bold text-2xl">This is heading</h1>
                <p className="my-0 text-md text-primary-content">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consequuntur totam amet exercitationem.
                </p>
                <button className="btn btn-primary self-star">button</button>
              </div>,
              {
                icon: "🎉",
              },
            );
          }}
        >
          Example toasts
        </button>
        <div className="flex-grow bg-secondary w-full mt-16 px-8 py-12">
          <div className="flex justify-center gap-12">
            <div className="flex flex-col bg-white px-10 py-10 text-center items-center max-w-xs">
              <BugAntIcon className="h-8 w-8" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref>
                  <a className="link">Debug Contract</a>
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-white px-10 py-10 text-center items-center max-w-xs">
              <SparklesIcon className="h-8 w-8" />
              <p>
                Experiment with{" "}
                <Link href="/example-ui" passHref>
                  <a className="link">Example UI</a>
                </Link>{" "}
                to build your own UI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
