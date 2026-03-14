"use client";

import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";

const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_URL
  ? `${process.env.NEXT_PUBLIC_PONDER_URL}/graphql`
  : "http://localhost:42069/graphql";

type GreetingChangeEvent = {
  id: string;
  greetingSetter: string;
  newGreeting: string;
  premium: boolean;
  value: string;
  blockNumber: string;
  transactionHash: string;
  timestamp: string;
};

type GraphQLResponse = {
  data?: {
    greetingChanges: {
      items: GreetingChangeEvent[];
    };
  };
  errors?: { message: string }[];
};

const GREETING_CHANGES_QUERY = `
  query GreetingChanges {
    greetingChanges(orderBy: "timestamp", orderDirection: "desc", limit: 25) {
      items {
        id
        greetingSetter
        newGreeting
        premium
        value
        blockNumber
        transactionHash
        timestamp
      }
    }
  }
`;

export const EventsDisplay = () => {
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
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result: GraphQLResponse = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map(e => e.message).join(", "));
      }

      setEvents(result.data?.greetingChanges?.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Poll every 5 seconds for new events
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && events.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl p-6">
        <div className="alert alert-error">
          <span>Error fetching events: {error}</span>
        </div>
        <p className="text-sm mt-4 text-center">
          Make sure the Ponder indexer is running with <code className="bg-base-300 px-1">yarn ponder:dev</code>
        </p>
        <div className="flex justify-center mt-4">
          <button className="btn btn-primary btn-sm" onClick={fetchEvents}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl p-6 text-center">
        <p className="text-lg">No GreetingChange events found yet.</p>
        <p className="text-sm mt-2">
          Use the{" "}
          <a href="/debug" className="link">
            Debug Contracts
          </a>{" "}
          page to call <code className="bg-base-300 px-1">setGreeting</code> and generate events.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Greeting Changes</h2>
        <button className="btn btn-primary btn-sm" onClick={fetchEvents}>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Setter</th>
              <th>Greeting</th>
              <th>Premium</th>
              <th>Value (ETH)</th>
              <th>Block</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
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
                <td>{event.blockNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
