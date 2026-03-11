"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { notification } from "~~/utils/scaffold-eth";

type MarketData = {
  success: boolean;
  data: {
    timestamp: string;
    market: {
      ethPrice: string;
      ethChange24h: string;
      gasPrice: string;
      topGainers: { token: string; change: string }[];
      topLosers: { token: string; change: string }[];
    };
    defi: {
      totalTvl: string;
      topProtocols: { name: string; tvl: string }[];
    };
    sentiment: {
      fearGreedIndex: number;
      label: string;
      recommendation: string;
    };
  };
};

const X402Demo: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPremiumData = async () => {
    if (!walletClient) {
      notification.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMarketData(null);

    try {
      // Create x402 client with the connected wallet as signer
      const account = walletClient.account;
      const signer = {
        address: account.address,
        signTypedData: walletClient.signTypedData,
      };

      const client = new x402Client();
      client.register("eip155:*", new ExactEvmScheme(signer));

      // Wrap fetch to automatically handle 402 payment responses
      const fetchWithPayment = wrapFetchWithPayment(fetch, client);

      notification.info("Requesting premium data (payment will be prompted)...");

      const response = await fetchWithPayment("/api/premium-data", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();
      setMarketData(result);
      notification.success("Premium data received! Payment settled.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch premium data";
      setError(message);
      notification.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <div className="max-w-3xl w-full">
        <h1 className="text-center mb-2">
          <span className="block text-4xl font-bold">x402 API Monetization</span>
        </h1>
        <p className="text-center text-lg text-base-content/70 mb-8">
          Pay-per-request API access using the x402 protocol. Each call costs <strong>$0.001 USDC</strong> on Base
          Sepolia.
        </p>

        {/* How it works */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">How it works</h2>
            <ol className="list-decimal list-inside space-y-2 text-base-content/80">
              <li>Connect your wallet (make sure you have USDC on Base Sepolia)</li>
              <li>
                Click <strong>Fetch Premium Data</strong> below
              </li>
              <li>Your wallet will prompt you to sign a payment authorization</li>
              <li>The x402 protocol handles payment verification and settlement</li>
              <li>You receive the premium market data</li>
            </ol>
          </div>
        </div>

        {/* Action card */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Premium Market Analytics</h2>
            <p className="text-base-content/70 mb-4">
              Get real-time crypto market data, DeFi protocol stats, and sentiment analysis.
            </p>
            <div className="badge badge-primary badge-lg mb-4">$0.001 USDC per request</div>
            <button className={`btn btn-primary btn-lg ${isLoading ? "loading" : ""}`} onClick={fetchPremiumData} disabled={isLoading || !walletClient}>
              {isLoading ? (
                <span className="loading loading-spinner" />
              ) : !walletClient ? (
                "Connect Wallet First"
              ) : (
                "Fetch Premium Data"
              )}
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Results display */}
        {marketData && (
          <div className="space-y-4 mb-10">
            <h2 className="text-2xl font-bold text-center">Market Data</h2>
            <p className="text-center text-sm text-base-content/50">
              Fetched at {new Date(marketData.data.timestamp).toLocaleString()}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Market Overview */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg">Market Overview</h3>
                  <div className="space-y-1">
                    <p>
                      <span className="font-semibold">ETH Price:</span> {marketData.data.market.ethPrice}
                    </p>
                    <p>
                      <span className="font-semibold">24h Change:</span>{" "}
                      <span className="text-success">{marketData.data.market.ethChange24h}</span>
                    </p>
                    <p>
                      <span className="font-semibold">Gas:</span> {marketData.data.market.gasPrice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sentiment */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg">Sentiment</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="radial-progress text-primary"
                      style={{ "--value": marketData.data.sentiment.fearGreedIndex } as React.CSSProperties}
                      role="progressbar"
                    >
                      {marketData.data.sentiment.fearGreedIndex}
                    </div>
                    <span className="badge badge-lg">{marketData.data.sentiment.label}</span>
                  </div>
                  <p className="text-sm text-base-content/70">{marketData.data.sentiment.recommendation}</p>
                </div>
              </div>

              {/* Top Gainers */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg">Top Gainers</h3>
                  <div className="space-y-1">
                    {marketData.data.market.topGainers.map(g => (
                      <div key={g.token} className="flex justify-between">
                        <span className="font-mono">{g.token}</span>
                        <span className="text-success font-semibold">{g.change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Losers */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-lg">Top Losers</h3>
                  <div className="space-y-1">
                    {marketData.data.market.topLosers.map(l => (
                      <div key={l.token} className="flex justify-between">
                        <span className="font-mono">{l.token}</span>
                        <span className="text-error font-semibold">{l.change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DeFi TVL */}
              <div className="card bg-base-100 shadow-md md:col-span-2">
                <div className="card-body">
                  <h3 className="card-title text-lg">DeFi Protocols (TVL: {marketData.data.defi.totalTvl})</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Protocol</th>
                          <th>TVL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.data.defi.topProtocols.map(p => (
                          <tr key={p.name}>
                            <td className="font-semibold">{p.name}</td>
                            <td>{p.tvl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default X402Demo;
