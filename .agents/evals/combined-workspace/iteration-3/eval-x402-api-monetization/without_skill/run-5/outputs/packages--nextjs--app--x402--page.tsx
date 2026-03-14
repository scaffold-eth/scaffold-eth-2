"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount, useWalletClient } from "wagmi";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { Address } from "@scaffold-ui/components";
import { createPaymentHeader, selectPaymentRequirements } from "x402/client";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { X402_NETWORK, X402_PRICE } from "~~/utils/x402/config";

type PremiumData = {
  timestamp: string;
  analytics: {
    totalTransactions24h: number;
    averageGasPrice: string;
    topContracts: { name: string; calls: number; gasUsed: string }[];
    defiMetrics: {
      totalValueLocked: string;
      dailyVolume: string;
      activeProtocols: number;
    };
    networkHealth: {
      blockTime: string;
      pendingTransactions: number;
      validatorCount: number;
    };
  };
  message: string;
};

const X402Page: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: walletClient } = useWalletClient();
  const [premiumData, setPremiumData] = useState<PremiumData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPremiumData = async () => {
    if (!walletClient || !connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPremiumData(null);

    try {
      // Step 1: Make initial request to get payment requirements (402 response)
      const initialResponse = await fetch("/api/premium-data");

      if (initialResponse.status === 402) {
        // Step 2: Extract payment requirements from the 402 response
        const paymentRequirementsHeader = initialResponse.headers.get("X-PAYMENT");
        if (!paymentRequirementsHeader) {
          throw new Error("No payment requirements received from server");
        }

        const paymentRequirements = JSON.parse(atob(paymentRequirementsHeader));

        // Step 3: Select appropriate payment requirement (defaults to USDC)
        const selectedRequirement = selectPaymentRequirements(
          Array.isArray(paymentRequirements) ? paymentRequirements : [paymentRequirements],
        );

        // Step 4: Create payment header (signs the payment authorization with wallet)
        notification.info("Please sign the payment authorization in your wallet...");

        const paymentHeader = await createPaymentHeader(walletClient, 1, selectedRequirement);

        // Step 5: Make the paid request with the payment header
        const paidResponse = await fetch("/api/premium-data", {
          headers: {
            "X-PAYMENT": paymentHeader,
          },
        });

        if (!paidResponse.ok) {
          throw new Error(`Payment failed: ${paidResponse.statusText}`);
        }

        const data = await paidResponse.json();
        setPremiumData(data);
        notification.success("Premium data accessed successfully!");
      } else if (initialResponse.ok) {
        // Payment was already satisfied or endpoint is not gated
        const data = await initialResponse.json();
        setPremiumData(data);
      } else {
        throw new Error(`Unexpected response: ${initialResponse.status}`);
      }
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
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">x402 API Monetization</h1>
          <p className="text-lg opacity-70">
            Access premium on-chain analytics by paying a small USDC micropayment
          </p>
        </div>

        {/* Payment Info Card */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">
              <CurrencyDollarIcon className="h-6 w-6" />
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-title">Price per Request</div>
                <div className="stat-value text-primary text-2xl">{X402_PRICE}</div>
                <div className="stat-desc">USDC</div>
              </div>
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-title">Network</div>
                <div className="stat-value text-secondary text-2xl">{X402_NETWORK}</div>
                <div className="stat-desc">Payment chain</div>
              </div>
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-title">Protocol</div>
                <div className="stat-value text-accent text-2xl">x402</div>
                <div className="stat-desc">HTTP 402 Payment Required</div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm opacity-70">
                Connected as:{" "}
                {connectedAddress ? (
                  <Address address={connectedAddress} chain={targetNetwork} />
                ) : (
                  <span className="italic">Not connected</span>
                )}
              </p>
            </div>

            <div className="card-actions justify-center mt-4">
              <button
                className={`btn btn-primary btn-lg ${isLoading ? "loading" : ""}`}
                onClick={fetchPremiumData}
                disabled={isLoading || !connectedAddress}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <CurrencyDollarIcon className="h-5 w-5" />
                )}
                {isLoading ? "Processing Payment..." : `Pay ${X402_PRICE} USDC & Get Data`}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-8">
            <span>{error}</span>
          </div>
        )}

        {/* Premium Data Display */}
        {premiumData && (
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-success">Premium Analytics Data</h2>
              <p className="text-sm opacity-70">Fetched at: {premiumData.timestamp}</p>

              {/* Network Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">24h Transactions</div>
                  <div className="stat-value text-lg">
                    {premiumData.analytics.totalTransactions24h.toLocaleString()}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Avg Gas Price</div>
                  <div className="stat-value text-lg">{premiumData.analytics.averageGasPrice}</div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Block Time</div>
                  <div className="stat-value text-lg">{premiumData.analytics.networkHealth.blockTime}</div>
                </div>
              </div>

              {/* DeFi Metrics */}
              <h3 className="font-bold mt-6 mb-2">DeFi Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Total Value Locked</div>
                  <div className="stat-value text-lg">{premiumData.analytics.defiMetrics.totalValueLocked}</div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Daily Volume</div>
                  <div className="stat-value text-lg">{premiumData.analytics.defiMetrics.dailyVolume}</div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Active Protocols</div>
                  <div className="stat-value text-lg">{premiumData.analytics.defiMetrics.activeProtocols}</div>
                </div>
              </div>

              {/* Top Contracts Table */}
              <h3 className="font-bold mt-6 mb-2">Top Contracts (24h)</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Contract</th>
                      <th>Calls</th>
                      <th>Gas Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {premiumData.analytics.topContracts.map((contract, index) => (
                      <tr key={index}>
                        <td className="font-medium">{contract.name}</td>
                        <td>{contract.calls.toLocaleString()}</td>
                        <td>{contract.gasUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="alert alert-success mt-4">
                <span>{premiumData.message}</span>
              </div>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">How x402 Works</h2>
            <ul className="steps steps-vertical">
              <li className="step step-primary">
                <div className="text-left ml-2">
                  <p className="font-bold">Client requests the API endpoint</p>
                  <p className="text-sm opacity-70">
                    A standard HTTP GET request is sent to /api/premium-data
                  </p>
                </div>
              </li>
              <li className="step step-primary">
                <div className="text-left ml-2">
                  <p className="font-bold">Server responds with HTTP 402</p>
                  <p className="text-sm opacity-70">
                    The response includes payment requirements (amount, token, network) in the X-PAYMENT header
                  </p>
                </div>
              </li>
              <li className="step step-primary">
                <div className="text-left ml-2">
                  <p className="font-bold">Client signs a payment authorization</p>
                  <p className="text-sm opacity-70">
                    Using EIP-3009 (transferWithAuthorization), the wallet signs a USDC transfer without submitting it
                    on-chain
                  </p>
                </div>
              </li>
              <li className="step step-primary">
                <div className="text-left ml-2">
                  <p className="font-bold">Client retries with payment header</p>
                  <p className="text-sm opacity-70">
                    The signed authorization is sent as an X-PAYMENT header on the retry request
                  </p>
                </div>
              </li>
              <li className="step step-primary">
                <div className="text-left ml-2">
                  <p className="font-bold">Facilitator verifies and settles</p>
                  <p className="text-sm opacity-70">
                    The x402 facilitator verifies the payment, the server returns data, then the facilitator settles the
                    USDC transfer on-chain
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default X402Page;
