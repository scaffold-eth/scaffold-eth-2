"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useX402 } from "~~/hooks/useX402";
import { PAID_API_PATH } from "~~/utils/x402";

type DefiProtocol = {
  name: string;
  tvl: string;
};

type PaidDataResponse = {
  timestamp: string;
  blockchainMetrics: {
    ethPrice: string;
    gasPrice: string;
    activeValidators: number;
    totalTransactions24h: number;
    avgBlockTime: string;
  };
  defiMetrics: {
    totalTvl: string;
    topProtocols: DefiProtocol[];
    volume24h: string;
  };
  message: string;
};

const PaidData: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { fetchPaidResource, data, isLoading, error } = useX402<PaidDataResponse>();
  const [requestCount, setRequestCount] = useState(0);

  const handleFetchData = async () => {
    const result = await fetchPaidResource(PAID_API_PATH);
    if (result) {
      setRequestCount(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Paid API Data</h1>
          <p className="text-lg opacity-80">
            Access premium blockchain analytics by paying $0.001 USDC per request via the x402 protocol.
          </p>
        </div>

        {/* How it works */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <CurrencyDollarIcon className="h-6 w-6" />
              How x402 Micropayments Work
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="badge badge-neutral mr-2">1</span>
                Your browser sends a request to the paid API endpoint.
              </p>
              <p>
                <span className="badge badge-neutral mr-2">2</span>
                The server responds with HTTP 402 and payment requirements (price, token, network).
              </p>
              <p>
                <span className="badge badge-neutral mr-2">3</span>
                Your wallet signs a USDC payment authorization (EIP-3009 transferWithAuthorization).
              </p>
              <p>
                <span className="badge badge-neutral mr-2">4</span>
                The signed payment is sent as a header, verified by a facilitator, and the data is returned.
              </p>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="stats shadow w-full mb-6">
          <div className="stat">
            <div className="stat-title">Price Per Request</div>
            <div className="stat-value text-primary">$0.001</div>
            <div className="stat-desc">USDC on Base Sepolia</div>
          </div>
          <div className="stat">
            <div className="stat-title">Requests Made</div>
            <div className="stat-value text-secondary">{requestCount}</div>
            <div className="stat-desc">This session</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Spent</div>
            <div className="stat-value">${(requestCount * 0.001).toFixed(4)}</div>
            <div className="stat-desc">USDC</div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-center mb-6">
          {!connectedAddress ? (
            <div className="alert alert-warning">
              <span>Please connect your wallet to access paid data. Make sure you are on Base Sepolia.</span>
            </div>
          ) : (
            <button
              className={`btn btn-primary btn-lg ${isLoading ? "loading" : ""}`}
              onClick={handleFetchData}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Processing Payment...
                </>
              ) : (
                "Fetch Premium Data ($0.001 USDC)"
              )}
            </button>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Data display */}
        {data && (
          <div className="space-y-4 mb-10">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Blockchain Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm opacity-60">ETH Price</p>
                    <p className="text-xl font-bold">${data.blockchainMetrics.ethPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Gas Price</p>
                    <p className="text-xl font-bold">{data.blockchainMetrics.gasPrice} gwei</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Active Validators</p>
                    <p className="text-xl font-bold">{data.blockchainMetrics.activeValidators.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">24h Transactions</p>
                    <p className="text-xl font-bold">{data.blockchainMetrics.totalTransactions24h.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Avg Block Time</p>
                    <p className="text-xl font-bold">{data.blockchainMetrics.avgBlockTime}s</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">DeFi Metrics</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm opacity-60">Total TVL</p>
                    <p className="text-xl font-bold">{data.defiMetrics.totalTvl}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">24h Volume</p>
                    <p className="text-xl font-bold">{data.defiMetrics.volume24h}</p>
                  </div>
                </div>
                <h3 className="font-semibold mt-2">Top Protocols</h3>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Protocol</th>
                        <th>TVL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.defiMetrics.topProtocols.map(protocol => (
                        <tr key={protocol.name}>
                          <td>{protocol.name}</td>
                          <td>{protocol.tvl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="text-center text-sm opacity-60">
              <p>Fetched at: {new Date(data.timestamp).toLocaleString()}</p>
              <p className="italic">{data.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaidData;
