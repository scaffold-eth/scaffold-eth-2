"use client";

import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type GreetingChangeEvent = {
  id: string;
  greetingSetter: string;
  newGreeting: string;
  premium: boolean;
  value: string;
  blockNumber: string;
  timestamp: string;
  transactionHash: string;
};

type GraphQLResponse = {
  data?: {
    greetingChanges: {
      items: GreetingChangeEvent[];
    };
  };
};

const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069/graphql";

const GREETING_CHANGES_QUERY = `
  query GetGreetingChanges {
    greetingChanges(orderBy: "blockNumber", orderDirection: "desc", limit: 50) {
      items {
        id
        greetingSetter
        newGreeting
        premium
        value
        blockNumber
        timestamp
        transactionHash
      }
    }
  }
`;

const Events: NextPage = () => {
  const [events, setEvents] = useState<GreetingChangeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { targetNetwork } = useTargetNetwork();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(PONDER_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: GREETING_CHANGES_QUERY }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const result: GraphQLResponse = await response.json();

      if (result.data?.greetingChanges?.items) {
        setEvents(result.data.greetingChanges.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events from Ponder");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-center">
        <span className="block text-4xl font-bold">Greeting Change Events</span>
        <span className="block text-lg mt-2">Indexed by Ponder via GraphQL</span>
      </h1>

      <div className="mt-4">
        <button className="btn btn-primary btn-sm" onClick={fetchEvents} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mt-4 max-w-2xl">
          <span>{error}</span>
          <span className="text-sm block mt-1">Make sure Ponder is running: yarn ponder:dev</span>
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="alert alert-info mt-4 max-w-2xl">
          <span>No greeting change events found. Try setting a greeting on the Debug Contracts page.</span>
        </div>
      )}

      {events.length > 0 && (
        <div className="overflow-x-auto w-full max-w-5xl mt-6">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Block</th>
                <th>Setter</th>
                <th>New Greeting</th>
                <th>Premium</th>
                <th>Value (ETH)</th>
                <th>Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>{event.blockNumber}</td>
                  <td>
                    <Address address={event.greetingSetter} chain={targetNetwork} />
                  </td>
                  <td className="max-w-xs truncate">{event.newGreeting}</td>
                  <td>
                    {event.premium ? (
                      <span className="badge badge-success">Yes</span>
                    ) : (
                      <span className="badge badge-ghost">No</span>
                    )}
                  </td>
                  <td>{formatEther(BigInt(event.value))}</td>
                  <td className="font-mono text-xs max-w-[120px] truncate">{event.transactionHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Events;
