"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { ArrowPathIcon, CurrencyDollarIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

type Builder = {
  address: string;
  name: string;
  builds: number;
  reputation: number;
  specialties: string[];
};

type BuilderData = {
  builders: Builder[];
  totalBuilders: number;
  lastUpdated: string;
  note: string;
};

const PremiumData: NextPage = () => {
  const [data, setData] = useState<BuilderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPremiumData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payment/builder");
      if (response.status === 402) {
        setError("Payment required. The x402 paywall should appear automatically for browser requests.");
        return;
      }
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch premium data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumData();
  }, []);

  return (
    <div className="flex flex-col items-center grow pt-10 px-5">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Premium Builder Data</h1>
          <p className="text-lg text-base-content/70">
            This page demonstrates x402 payment-gated content. Access costs $0.01 USDC on Base Sepolia.
          </p>
        </div>

        {/* How it works */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">How x402 Payments Work</h2>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3">
                <div className="badge badge-primary badge-lg">1</div>
                <div>
                  <p className="font-semibold">Request without payment</p>
                  <p className="text-sm text-base-content/60">
                    Client sends a GET request. Server responds with 402 + payment instructions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="badge badge-primary badge-lg">2</div>
                <div>
                  <p className="font-semibold">Sign payment authorization</p>
                  <p className="text-sm text-base-content/60">
                    Client signs an EIP-712 message authorizing a USDC transfer. No transaction is sent yet.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="badge badge-primary badge-lg">3</div>
                <div>
                  <p className="font-semibold">Retry with payment</p>
                  <p className="text-sm text-base-content/60">
                    Client retries the request with the signed payment in the X-PAYMENT header. Server verifies and
                    serves the content.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="badge badge-primary badge-lg">4</div>
                <div>
                  <p className="font-semibold">Settlement</p>
                  <p className="text-sm text-base-content/60">
                    The facilitator executes the USDC transfer onchain after content delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex items-center gap-2 badge badge-lg badge-outline p-4">
            <CurrencyDollarIcon className="h-5 w-5" />
            <span>$0.01 USDC per request</span>
          </div>
          <div className="flex items-center gap-2 badge badge-lg badge-outline p-4">
            <ShieldCheckIcon className="h-5 w-5" />
            <span>Base Sepolia (testnet)</span>
          </div>
        </div>

        {/* Fetch button */}
        <div className="text-center mb-8">
          <button className="btn btn-primary btn-lg" onClick={fetchPremiumData} disabled={loading}>
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Fetching...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5" />
                Fetch Premium Data ($0.01)
              </>
            )}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="alert alert-warning mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Data display */}
        {data && (
          <div className="space-y-4">
            <div className="alert alert-success mb-4">
              <span>{data.note}</span>
            </div>
            <div className="text-sm text-base-content/60 mb-4">
              Last updated: {new Date(data.lastUpdated).toLocaleString()} | Total builders: {data.totalBuilders}
            </div>
            {data.builders.map(builder => (
              <div key={builder.address} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title text-lg">{builder.name}</h3>
                      <p className="text-sm text-base-content/50 font-mono">{builder.address}</p>
                    </div>
                    <div className="badge badge-secondary badge-lg">Rep: {builder.reputation}</div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-semibold">{builder.builds}</span> builds completed
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {builder.specialties.map(specialty => (
                        <span key={specialty} className="badge badge-outline badge-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CLI instructions */}
        <div className="card bg-base-200 shadow-xl mt-8 mb-8">
          <div className="card-body">
            <h2 className="card-title">Test via CLI</h2>
            <p className="text-sm text-base-content/70 mb-2">
              You can also test the payment-gated API programmatically:
            </p>
            <div className="mockup-code">
              <pre>
                <code># Test 402 response (no payment)</code>
              </pre>
              <pre>
                <code>curl -v http://localhost:3000/api/payment/builder</code>
              </pre>
              <pre>
                <code></code>
              </pre>
              <pre>
                <code># Pay and fetch (needs funded wallet on Base Sepolia)</code>
              </pre>
              <pre>
                <code>yarn send402request</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumData;
