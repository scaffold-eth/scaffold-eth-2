"use client";

import { gql, request } from "graphql-request";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { Address } from "@scaffold-ui/components";
import { useQuery } from "@tanstack/react-query";

const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

type GreetingChangeItem = {
  id: string;
  greetingSetter: string;
  newGreeting: string;
  premium: boolean;
  value: string;
  timestamp: number;
};

type GreetingChangesResponse = {
  greetingChanges: {
    items: GreetingChangeItem[];
  };
};

const fetchGreetingChanges = async (): Promise<GreetingChangesResponse> => {
  const query = gql`
    query {
      greetingChanges(orderBy: "timestamp", orderDirection: "desc") {
        items {
          id
          greetingSetter
          newGreeting
          premium
          value
          timestamp
        }
      }
    }
  `;
  return request(`${PONDER_URL}/graphql`, query);
};

const Events: NextPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["greeting-changes"],
    queryFn: fetchGreetingChanges,
    refetchInterval: 5000,
  });

  const greetingChanges = data?.greetingChanges?.items ?? [];

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Indexed Events</span>
          <span className="block text-4xl font-bold">Greeting Changes</span>
        </h1>
        <p className="text-center text-lg mt-2 mb-8">
          Events indexed by Ponder from the <code className="bg-base-300 px-1 rounded">YourContract</code> smart
          contract.
        </p>

        {isLoading && (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>
              Failed to fetch events. Make sure Ponder is running (<code>yarn ponder:dev</code>).
            </span>
          </div>
        )}

        {!isLoading && !error && greetingChanges.length === 0 && (
          <div className="alert alert-info">
            <span>No greeting change events found yet. Try setting a greeting on the Debug Contracts page.</span>
          </div>
        )}

        {greetingChanges.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Setter</th>
                  <th>Greeting</th>
                  <th>Premium</th>
                  <th>Value (ETH)</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {greetingChanges.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <Address address={event.greetingSetter} />
                    </td>
                    <td>{event.newGreeting}</td>
                    <td>
                      {event.premium ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-ghost">No</span>
                      )}
                    </td>
                    <td>{formatEther(BigInt(event.value))}</td>
                    <td>{new Date(event.timestamp * 1000).toLocaleString()}</td>
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
