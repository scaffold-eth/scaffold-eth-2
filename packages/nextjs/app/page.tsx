"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex flex-col gap-2">
            <Button>Click me</Button>
            <Button variant="outline">Click me</Button>
            <Button variant="secondary">Click me</Button>
            <Button variant="ghost">Click me</Button>
            <Button variant="link">Click me</Button>
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
