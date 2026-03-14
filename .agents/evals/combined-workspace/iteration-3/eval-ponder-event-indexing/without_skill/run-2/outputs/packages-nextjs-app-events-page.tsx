"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { hardhat } from "viem/chains";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useGreetingChanges } from "~~/hooks/useGreetingChanges";

const Events: NextPage = () => {
  const [searchAddress, setSearchAddress] = useState("");
  const { targetNetwork } = useTargetNetwork();
  const { data, isLoading, error, refetch } = useGreetingChanges({
    greetingSetter: searchAddress || undefined,
  });

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-center">
        <span className="block text-4xl font-bold">Greeting Events</span>
        <span className="block text-lg mt-2">
          Indexed by Ponder from YourContract
        </span>
      </h1>

      <div className="flex flex-col items-center mt-8 w-full max-w-3xl">
        {/* Search and refresh controls */}
        <div className="flex w-full gap-4 mb-6">
          <div className="form-control flex-1">
            <div className="input-group flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter by address (0x...)"
                className="input input-bordered w-full"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
              <button
                className="btn btn-primary btn-square"
                onClick={() => refetch()}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        {isLoading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="loading loading-spinner loading-md"></span>
            <span>Loading events from Ponder...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4 max-w-xl">
            <span>
              Failed to fetch events. Make sure Ponder is running (
              <code>yarn ponder:dev</code>).
            </span>
          </div>
        )}

        {/* Events list */}
        {data && data.length === 0 && !isLoading && (
          <div className="alert alert-info mb-4 max-w-xl">
            <span>
              No greeting change events found. Try setting a greeting on the
              Debug Contracts page.
            </span>
          </div>
        )}

        <div className="w-full space-y-4">
          {data?.map((event) => (
            <div
              key={event.id}
              className="card bg-base-100 shadow-xl border border-base-300"
            >
              <div className="card-body p-5">
                <div className="flex flex-col gap-2">
                  {/* Header row with address and premium badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold opacity-60">
                        From:
                      </span>
                      <Address
                        address={event.greetingSetter}
                        chain={targetNetwork}
                        blockExplorerAddressLink={
                          targetNetwork.id === hardhat.id
                            ? `/blockexplorer/address/${event.greetingSetter}`
                            : undefined
                        }
                      />
                    </div>
                    {event.premium && (
                      <span className="badge badge-accent">Premium</span>
                    )}
                  </div>

                  {/* Greeting message */}
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-lg font-medium break-words">
                      &ldquo;{event.newGreeting}&rdquo;
                    </p>
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap gap-4 text-sm opacity-70">
                    {BigInt(event.value) > 0n && (
                      <span>
                        Value: {formatEther(BigInt(event.value))} ETH
                      </span>
                    )}
                    <span>Block: {event.blockNumber}</span>
                    <span>
                      Tx:{" "}
                      <code className="text-xs">
                        {event.transactionHash.slice(0, 10)}...
                        {event.transactionHash.slice(-8)}
                      </code>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
