import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import MetaHeader from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="Scaffold-ETH 2 App"
        description="Created with 🏗 scaffold-eth-2"
        favicon="/favicon.png"
        ogTitle="Scaffold-ETH 2 App"
        ogDescription="Created with 🏗 scaffold-eth-2"
        ogImage="/thumbnail.jpg"
        twitterCard="summary_large_image"
        twitterTitle="Scaffold-ETH 2 App"
        twitterDescription="Created with 🏗 scaffold-eth-2"
        twitterImage={typeof window !== "undefined" ? `${window.location.origin}/thumbnail.jpg` : undefined}
      />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold">packages/nextjs/pages/index.tsx</code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract <code className="italic bg-base-300 text-base font-bold">YourContract.sol</code> in{" "}
            <code className="italic bg-base-300 text-base font-bold">packages/hardhat/contracts</code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contract
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SparklesIcon className="h-8 w-8 fill-secondary" />
              <p>
                Experiment with{" "}
                <Link href="/example-ui" passHref className="link">
                  Example UI
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
