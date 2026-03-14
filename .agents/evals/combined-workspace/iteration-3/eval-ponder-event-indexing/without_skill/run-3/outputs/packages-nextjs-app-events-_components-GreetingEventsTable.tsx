"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { Address } from "@scaffold-ui/components";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useGreetingEvents } from "~~/hooks/ponder/useGreetingEvents";

const ITEMS_PER_PAGE = 10;

const GreetingEventsTable = () => {
  const [page, setPage] = useState(0);
  const { targetNetwork } = useTargetNetwork();
  const { data, isLoading, isError, error } = useGreetingEvents({
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <p>Failed to load events from Ponder. Make sure the Ponder indexer is running (`yarn ponder:dev`).</p>
        <p className="text-sm opacity-70">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  const events = data?.greetingChanges?.items ?? [];

  if (events.length === 0 && page === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">No greeting change events found.</p>
        <p className="text-sm opacity-70 mt-2">
          Try setting a greeting on the Debug Contracts page to generate events.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Sender</th>
            <th>New Greeting</th>
            <th>Premium</th>
            <th>Value (ETH)</th>
            <th>Block</th>
            <th>Tx Hash</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event: GreetingChangeEvent) => (
            <tr key={event.id}>
              <td>
                <Address address={event.greetingSetter} chain={targetNetwork} />
              </td>
              <td className="max-w-xs truncate">{event.newGreeting}</td>
              <td>
                {event.premium ? (
                  <span className="badge badge-success badge-sm">Yes</span>
                ) : (
                  <span className="badge badge-ghost badge-sm">No</span>
                )}
              </td>
              <td>{formatEther(BigInt(event.value))}</td>
              <td>{event.blockNumber}</td>
              <td className="font-mono text-xs max-w-[120px] truncate">
                {event.transactionHash}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center gap-2 mt-4">
        <button
          className="btn btn-sm btn-primary"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </button>
        <span className="btn btn-sm btn-ghost no-animation">Page {page + 1}</span>
        <button
          className="btn btn-sm btn-primary"
          disabled={events.length < ITEMS_PER_PAGE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

type GreetingChangeEvent = {
  id: string;
  greetingSetter: `0x${string}`;
  newGreeting: string;
  premium: boolean;
  value: string;
  blockNumber: string;
  timestamp: string;
  transactionHash: `0x${string}`;
};

export default GreetingEventsTable;
