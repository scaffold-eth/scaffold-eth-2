"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="p-6 text-sm">
        <h1 className="text-primary pb-6 text-lg">Welcome to Scaffold-ETH 2</h1>
        <div className="flex space-x-2 flex-col sm:flex-row">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address size="sm" address={connectedAddress} />
        </div>
        <p className="">
          Get started by editing{" "}
          <code className="bg-base-300 text-primary max-w-full break-words break-all inline-block">
            packages/nextjs/app/page.tsx
          </code>
        </p>
        <p className="">
          Edit your smart contract{" "}
          <code className="bg-base-300 text-primary max-w-full break-words break-all inline-block">
            YourContract.sol
          </code>{" "}
          in{" "}
          <code className="bg-base-300 text-primary max-w-full break-words break-all inline-block">
            packages/hardhat/contracts
          </code>
        </p>

        <p>
          Tinker with your smart contract using the{" "}
          <Link href="/debug" passHref className="link">
            Debug Contracts
          </Link>{" "}
          tab.
        </p>

        <p>
          Explore your local transactions with the{" "}
          <Link href="/blockexplorer" passHref className="link">
            Block Explorer
          </Link>{" "}
          tab.
        </p>
      </div>
    </>
  );
};

export default Home;
