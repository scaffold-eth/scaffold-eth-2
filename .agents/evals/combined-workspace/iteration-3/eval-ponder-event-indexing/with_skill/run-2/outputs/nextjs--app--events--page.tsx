"use client";

import { gql, request } from "graphql-request";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { formatEther } from "viem";
import { useQuery } from "@tanstack/react-query";
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
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["greetingChanges"],
    queryFn: fetchGreetingChanges,
    refetchInterval: 5000,
  });

  const greetings = data?.greetingChanges?.items ?? [];

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Greeting Events</span>
          <span className="block text-lg mt-2">Indexed by Ponder</span>
        </h1>

        <div className="mt-8">
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
              <span>No greeting events found yet. Try setting a greeting on the contract!</span>
            </div>
          )}

          {greetings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Setter</th>
                    <th>Greeting</th>
                    <th>Value (ETH)</th>
                    <th>Premium</th>
                    <th>Block</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {greetings.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Address
                          address={item.greetingSetter}
                          chain={targetNetwork}
                          blockExplorerAddressLink={
                            isLocalNetwork
                              ? `/blockexplorer/address/${item.greetingSetter}`
                              : undefined
                          }
                        />
                      </td>
                      <td className="max-w-xs truncate">{item.newGreeting}</td>
                      <td>{formatEther(BigInt(item.value))}</td>
                      <td>
                        {item.premium ? (
                          <span className="badge badge-success">Yes</span>
                        ) : (
                          <span className="badge badge-ghost">No</span>
                        )}
                      </td>
                      <td>{item.blockNumber}</td>
                      <td>{new Date(item.timestamp * 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
