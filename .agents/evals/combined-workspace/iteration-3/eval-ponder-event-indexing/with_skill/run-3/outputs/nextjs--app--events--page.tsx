"use client";

import { formatEther } from "viem";
import { Address } from "@scaffold-ui/components";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import type { NextPage } from "next";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

type GreetingChangeItem = {
  id: string;
  greetingSetter: string;
  newGreeting: string;
  premium: boolean;
  value: string;
  timestamp: number;
  blockNumber: string;
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
          blockNumber
        }
      }
    }
  `;
  return request(`${PONDER_URL}/graphql`, query);
};

const Events: NextPage = () => {
  const { targetNetwork } = useTargetNetwork();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["greetingChanges"],
    queryFn: fetchGreetingChanges,
    refetchInterval: 5000,
  });

  const greetings = data?.greetingChanges?.items ?? [];

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-center">
        <span className="block text-2xl mb-2">Indexed Events</span>
        <span className="block text-4xl font-bold">Greeting Changes</span>
      </h1>
      <p className="text-center text-lg mt-2 text-base-content/70">
        Events indexed by Ponder from YourContract
      </p>

      <div className="w-full max-w-4xl mt-8">
        {isLoading && (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {isError && (
          <div className="alert alert-error">
            <span>
              Failed to fetch events. Make sure Ponder is running ({PONDER_URL}).
              {error instanceof Error ? ` Error: ${error.message}` : ""}
            </span>
          </div>
        )}

        {!isLoading && !isError && greetings.length === 0 && (
          <div className="alert alert-info">
            <span>
              No greeting change events found. Make sure Ponder is running and contracts are deployed.
            </span>
          </div>
        )}

        {greetings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Setter</th>
                  <th>Greeting</th>
                  <th>Premium</th>
                  <th>Value (ETH)</th>
                  <th>Block</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {greetings.map((greeting) => (
                  <tr key={greeting.id}>
                    <td>
                      <Address address={greeting.greetingSetter} chain={targetNetwork} />
                    </td>
                    <td className="max-w-xs truncate">{greeting.newGreeting}</td>
                    <td>
                      {greeting.premium ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-ghost">No</span>
                      )}
                    </td>
                    <td>{formatEther(BigInt(greeting.value))}</td>
                    <td>{greeting.blockNumber}</td>
                    <td>{new Date(greeting.timestamp * 1000).toLocaleString()}</td>
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
