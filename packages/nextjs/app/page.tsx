"use client";

// import Link from "next/link";
// import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
// import { hardhat } from "viem/chains";
import { useAccount, useBalance } from "wagmi";

// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address, chain, isConnected } = useAccount();
  const balance = useBalance({ address: address });
  // const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <div className="grid grid-cols-12 gap-x-4 m-5">
        <div className="col-span-6">Wallet Connection Status</div>
        <div className="col-span-6">Network</div>
        <div className="col-span-6">
          <input
            type="text"
            placeholder={isConnected ? "Connected" : "Not Connected"}
            className={`input ${isConnected ? "!input-success" : "!input-error"} rounded-md w-full`}
          />
        </div>
        <div className="col-span-6">
          <input
            type="text"
            placeholder={isConnected ? chain?.name || "unknowm" : "No Nework"}
            className={`input ${isConnected ? "!input-success" : "!input-error"} rounded-md w-full`}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-x-4 m-5">
        <div className="col-span-4">Wallet Address</div>
        <div className="col-span-4">Monad Name Service</div>
        <div className="col-span-4">Wallet Balance</div>
        <div className="col-span-4">
          <input
            type="text"
            placeholder={isConnected ? address : "No Nework"}
            className={`input ${isConnected ? "!input-success" : "!input-error"} rounded-md w-full`}
          />
        </div>
        <div className="col-span-4">
          <input
            type="text"
            placeholder="xxxxx.nad"
            className={`input ${isConnected ? "!input-success" : "!input-error"} rounded-md w-full`}
          />
        </div>
        <div className="col-span-4">
          <input
            type="text"
            placeholder={
              balance.isLoading
                ? "loading.."
                : balance.data
                  ? `${balance.data?.formatted} ${balance.data.symbol}`
                  : "Not Connected!"
            }
            className={`input ${isConnected ? "!input-success" : "!input-error"} rounded-md w-full`}
          />
        </div>
      </div>

      <div className="grid grid-cols-8 gap-x-4 m-5">
        <div className="col-span-4">Wallet NFT Count</div>
        <div className="col-span-4">
          <button className="btn">Add Monad Network</button>
        </div>
        <div className="col-span-4">
          {" "}
          <input type="text" placeholder="0 NFT" className="input !input-error rounded-md w-100" />
        </div>
      </div>
    </>
  );
};

export default Home;
