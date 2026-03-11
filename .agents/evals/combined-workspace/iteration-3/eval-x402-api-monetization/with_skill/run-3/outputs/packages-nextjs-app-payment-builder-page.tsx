"use client";

import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { baseSepolia } from "viem/chains";

type Builder = {
  address: string;
  name: string;
  builds: number;
  reputation: number;
  specialties: string[];
};

type BuilderResponse = {
  success: boolean;
  data: {
    builders: Builder[];
    totalBuilders: number;
    lastUpdated: string;
  };
  meta: {
    paymentRequired: boolean;
    price: string;
    network: string;
  };
};

const PremiumBuilderPage: NextPage = () => {
  const [builderData, setBuilderData] = useState<BuilderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/payment/builder");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setBuilderData(data);
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
      <h1 className="text-center text-3xl font-bold mb-2">Premium Builder Directory</h1>
      <p className="text-center text-lg text-base-content/70 mb-8">
        This data is gated behind a $0.01 USDC micropayment via the x402 protocol.
      </p>

      {loading && (
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-md"></span>
          <span>Loading premium data...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error max-w-lg">
          <span>{error}</span>
        </div>
      )}

      {builderData && (
        <div className="w-full max-w-4xl">
          <div className="stats shadow mb-8 w-full">
            <div className="stat">
              <div className="stat-title">Total Builders</div>
              <div className="stat-value">{builderData.data.totalBuilders}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Payment</div>
              <div className="stat-value text-success text-lg">{builderData.meta.price}</div>
              <div className="stat-desc">{builderData.meta.network}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Last Updated</div>
              <div className="stat-value text-lg">{new Date(builderData.data.lastUpdated).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builderData.data.builders.map(builder => (
              <div key={builder.address} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">{builder.name}</h2>
                  <Address address={builder.address} chain={baseSepolia} />
                  <div className="flex justify-between mt-2">
                    <div className="badge badge-primary">{builder.builds} builds</div>
                    <div className="badge badge-secondary">Rep: {builder.reputation}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {builder.specialties.map(spec => (
                      <div key={spec} className="badge badge-outline badge-sm">
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumBuilderPage;
