"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const PONDER_URL =
  process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

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
  const [isRefetching, setIsRefetching] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["greetingChanges"],
    queryFn: fetchGreetingChanges,
    refetchInterval: 10000,
  });

  const handleRefetch = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  const greetings = data?.greetingChanges?.items ?? [];

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-4xl font-bold mb-2">Greeting Events</h1>
      <p className="text-lg text-base-content/70 mb-8">
        GreetingChange events indexed by Ponder
      </p>

      <div className="mb-4">
        <button
          className={`btn btn-primary btn-sm ${isRefetching ? "loading" : ""}`}
          onClick={handleRefetch}
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {isError && (
        <div className="alert alert-error max-w-2xl">
          <span>
            Failed to fetch events. Make sure Ponder is running ({PONDER_URL}).
            {error instanceof Error ? ` Error: ${error.message}` : ""}
          </span>
        </div>
      )}

      {!isLoading && !isError && greetings.length === 0 && (
        <div className="alert alert-info max-w-2xl">
          <span>
            No greeting events found. Try setting a greeting on the contract
            first.
          </span>
        </div>
      )}

      {greetings.length > 0 && (
        <div className="w-full max-w-4xl overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Greeting</th>
                <th>Setter</th>
                <th>Premium</th>
                <th>Value (ETH)</th>
                <th>Block</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {greetings.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.newGreeting}</td>
                  <td>
                    <Address
                      address={item.greetingSetter}
                      chain={targetNetwork}
                    />
                  </td>
                  <td>
                    {item.premium ? (
                      <span className="badge badge-success">Yes</span>
                    ) : (
                      <span className="badge badge-ghost">No</span>
                    )}
                  </td>
                  <td>{formatEther(BigInt(item.value))}</td>
                  <td>{item.blockNumber}</td>
                  <td>
                    {new Date(item.timestamp * 1000).toLocaleString()}
                  </td>
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
