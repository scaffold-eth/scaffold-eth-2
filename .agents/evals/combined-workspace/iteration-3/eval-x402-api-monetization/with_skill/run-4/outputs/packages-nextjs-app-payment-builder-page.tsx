"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";

type Builder = {
  rank: number;
  address: string;
  username: string;
  reputation: number;
  projectsShipped: number;
};

type LeaderboardData = {
  title: string;
  updatedAt: string;
  builders: Builder[];
};

const PremiumBuilderPage: NextPage = () => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/payment/builder");
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Premium Builder Leaderboard</h1>
      <p className="text-lg text-base-content/70 mb-8">
        This page is gated by an x402 micropayment ($0.01 USDC on Base Sepolia).
      </p>

      {loading && (
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-md"></span>
          <span>Loading leaderboard data...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error max-w-lg">
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="w-full max-w-3xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{data.title}</h2>
              <p className="text-sm text-base-content/60">
                Last updated: {new Date(data.updatedAt).toLocaleString()}
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Builder</th>
                      <th>Address</th>
                      <th>Reputation</th>
                      <th>Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.builders.map(builder => (
                      <tr key={builder.rank}>
                        <td className="font-bold">#{builder.rank}</td>
                        <td>{builder.username}</td>
                        <td className="font-mono text-sm">
                          {builder.address.slice(0, 6)}...{builder.address.slice(-4)}
                        </td>
                        <td>{builder.reputation.toLocaleString()}</td>
                        <td>{builder.projectsShipped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-md mt-6 mb-8">
            <div className="card-body">
              <h3 className="card-title text-lg">How x402 Works</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>When you visited this page, the x402 middleware intercepted the request.</li>
                <li>If you had no payment, a paywall UI was shown asking for $0.01 USDC.</li>
                <li>You signed an EIP-712 authorization (no transaction sent from your wallet).</li>
                <li>The facilitator verified your signature and settled the USDC transfer onchain.</li>
                <li>The server delivered this premium content after payment confirmation.</li>
              </ul>
              <p className="text-xs text-base-content/50 mt-2">
                Payments are processed on Base Sepolia via the x402 facilitator. Get test USDC from{" "}
                <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer" className="link">
                  Circle Faucet
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumBuilderPage;
