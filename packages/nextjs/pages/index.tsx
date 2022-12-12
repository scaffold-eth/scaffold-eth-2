import type { NextPage } from "next";
import Head from "next/head";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <main className="flex items-center flex-col pt-10">
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

        <div className="bg-secondary w-full mt-16 px-8 py-16">
          <div className="flex justify-center gap-12">
            <div className="flex flex-col bg-white px-16 py-10 text-center items-center max-w-sm">
              <BugAntIcon className="h-10 w-10" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref>
                  <a className="underline">Debug Contract</a>
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-white px-16 py-10 text-center items-center max-w-sm">
              <SparklesIcon className="h-10 w-10" />
              <p>
                Experiment with{" "}
                <Link href="/example-ui" passHref>
                  <a className="underline">Example UI</a>
                </Link>{" "}
                to build your own UI.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
