import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex flex-grow flex-col items-center pt-10">
        <div className="px-5">
          <h1 className="mb-8 text-center">
            <span className="mb-2 block text-2xl">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="bg-base-300 text-base font-bold italic">packages/nextjs/pages/index.tsx</code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract <code className="bg-base-300 text-base font-bold italic">YourContract.sol</code> in{" "}
            <code className="bg-base-300 text-base font-bold italic">packages/hardhat/contracts</code>
          </p>
        </div>

        <div className="mt-16 w-full flex-grow bg-base-300 px-8 py-12">
          <div className="flex flex-col items-center justify-center gap-12 sm:flex-row">
            <div className="flex max-w-xs flex-col items-center rounded-3xl bg-base-100 px-10 py-10 text-center">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contract
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex max-w-xs flex-col items-center rounded-3xl bg-base-100 px-10 py-10 text-center">
              <SparklesIcon className="h-8 w-8 fill-secondary" />
              <p>
                Experiment with{" "}
                <Link href="/example-ui" passHref className="link">
                  Example UI
                </Link>{" "}
                to build your own UI.
              </p>
            </div>
            <div className="flex max-w-xs flex-col items-center rounded-3xl bg-base-100 px-10 py-10 text-center">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
