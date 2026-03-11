"use client";

import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { formatEther } from "viem";

const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069/graphql";

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

const GREETING_CHANGES_QUERY = `
  query GreetingChanges($orderBy: String, $orderDirection: String, $limit: Int) {
    greetingChanges(orderBy: $orderBy, orderDirection: $orderDirection, limit: $limit) {
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

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(PONDER_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: GREETING_CHANGES_QUERY,
          variables: {
            orderBy: "timestamp",
            orderDirection: "desc",
            limit: 25,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ponder API responded with status ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL query failed");
      }

      setEvents(result.data.greetingChanges.items);
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
  }, []);

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">Ponder Indexed Events</span>
          <span className="block text-4xl font-bold">Greeting Changes</span>
        </h1>

        <p className="text-center text-lg mb-8">
          Events indexed from <code className="italic bg-base-300 text-base font-bold">YourContract</code> by Ponder
          and served via GraphQL.
        </p>

        <div className="flex justify-center mb-6">
          <button className="btn btn-primary btn-sm" onClick={fetchEvents} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <span>
              {error}. Make sure Ponder is running (<code>yarn ponder:dev</code>).
            </span>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="alert alert-info mb-6">
            <span>No greeting change events found. Try setting a greeting on the Debug Contracts page.</span>
          </div>
        )}

        {events.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Setter</th>
                  <th>New Greeting</th>
                  <th>Premium</th>
                  <th>Value (ETH)</th>
                  <th>Block</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>
                      <Address address={event.greetingSetter} />
                    </td>
                    <td>{event.newGreeting}</td>
                    <td>
                      <span className={`badge ${event.premium ? "badge-success" : "badge-neutral"}`}>
                        {event.premium ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{formatEther(BigInt(event.value))}</td>
                    <td>{event.blockNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
