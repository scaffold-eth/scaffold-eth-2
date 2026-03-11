"use client";

import { formatEther } from "viem";
import { Address } from "@scaffold-ui/components";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useGreetingSenders } from "~~/hooks/ponder/useGreetingSenders";

const GreetingSendersTable = () => {
  const { targetNetwork } = useTargetNetwork();
  const { data, isLoading, isError, error } = useGreetingSenders();

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
        <p>Failed to load sender data from Ponder.</p>
        <p className="text-sm opacity-70">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  const senders = data?.greetingSenders?.items ?? [];

  if (senders.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">No greeting senders found yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Address</th>
            <th>Greeting Count</th>
            <th>Last Greeting</th>
            <th>Total Value (ETH)</th>
          </tr>
        </thead>
        <tbody>
          {senders.map((sender: GreetingSender) => (
            <tr key={sender.address}>
              <td>
                <Address address={sender.address} chain={targetNetwork} />
              </td>
              <td>{sender.greetingCount}</td>
              <td className="max-w-xs truncate">{sender.lastGreeting}</td>
              <td>{formatEther(BigInt(sender.totalValue))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

type GreetingSender = {
  address: `0x${string}`;
  greetingCount: number;
  lastGreeting: string;
  lastTimestamp: string;
  totalValue: string;
};

export default GreetingSendersTable;
