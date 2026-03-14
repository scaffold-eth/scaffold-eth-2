"use client";

import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowPathIcon, CurrencyDollarIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { useX402Payment } from "~~/hooks/x402";
import { x402Config } from "~~/x402.config";

const PaidApi: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { fetchPaidData, isPaying, isFetching, data, error, txHash } = useX402Payment();

  const isLoading = isPaying || isFetching;

  const handleFetchData = async () => {
    await fetchPaidData("/api/paid-data");
  };

  return (
    <div className="flex items-center flex-col grow pt-10 px-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Payment-Gated API</h1>
          <p className="text-lg opacity-80">
            Access premium data by paying <span className="font-bold text-primary">{x402Config.priceUSDC} USDC</span>{" "}
            per request using the x402 protocol
          </p>
        </div>

        {/* Protocol Info Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <CurrencyDollarIcon className="h-6 w-6" />
              How x402 Works
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary badge-sm mt-1">1</div>
                <p>Your app requests data from the payment-gated API endpoint</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary badge-sm mt-1">2</div>
                <p>
                  Server responds with <code className="badge badge-ghost badge-sm">HTTP 402</code> and payment
                  requirements (price, token, recipient)
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary badge-sm mt-1">3</div>
                <p>Your wallet sends a USDC transfer to the API provider</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary badge-sm mt-1">4</div>
                <p>
                  The request is retried with the payment proof in the{" "}
                  <code className="badge badge-ghost badge-sm">X-PAYMENT</code> header
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="badge badge-primary badge-sm mt-1">5</div>
                <p>Server verifies the on-chain payment and returns the premium data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <LockClosedIcon className="h-6 w-6" />
              Payment Details
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td className="font-semibold">Network</td>
                    <td>{x402Config.chain.name}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Token</td>
                    <td>USDC</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Price per request</td>
                    <td>{x402Config.priceUSDC} USDC</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Recipient</td>
                    <td>
                      <Address address={x402Config.recipientAddress} chain={x402Config.chain} />
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Endpoint</td>
                    <td>
                      <code className="text-xs">{x402Config.resource}</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
          <button
            className={`btn btn-primary btn-lg gap-2 ${isLoading ? "loading" : ""}`}
            onClick={handleFetchData}
            disabled={isLoading || !connectedAddress}
          >
            {isPaying ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : isFetching ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Fetching Data...
              </>
            ) : (
              <>
                <LockOpenIcon className="h-5 w-5" />
                Pay & Fetch Data ({x402Config.priceUSDC} USDC)
              </>
            )}
          </button>
        </div>

        {!connectedAddress && (
          <div className="alert alert-warning mb-6">
            <span>Please connect your wallet to use the payment-gated API.</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="alert alert-info mb-6">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Payment Transaction:</span>
              <a
                href={`${x402Config.chain.blockExplorers?.default?.url}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover text-sm break-all"
              >
                {txHash}
              </a>
            </div>
          </div>
        )}

        {/* Premium Data Display */}
        {data && (
          <div className="card bg-base-100 shadow-xl mb-6 border-2 border-success">
            <div className="card-body">
              <h2 className="card-title text-success">
                <LockOpenIcon className="h-6 w-6" />
                Premium Data Retrieved
              </h2>

              {data.marketInsights ? (
                <PremiumDataDisplay data={data} />
              ) : (
                <pre className="bg-base-200 p-4 rounded-xl text-xs overflow-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Renders the structured premium data */
const PremiumDataDisplay = ({ data }: { data: Record<string, unknown> }) => {
  const insights = data.marketInsights as Record<string, unknown>;
  const topProtocols = insights.topProtocols as Array<Record<string, string>>;
  const networkActivity = insights.networkActivity as Record<string, string>;

  return (
    <div className="flex flex-col gap-4">
      <div className="stat bg-base-200 rounded-xl">
        <div className="stat-title">Ethereum Trend</div>
        <div className="stat-value text-lg capitalize">{insights.ethereumTrend as string}</div>
        <div className="stat-desc">Gas: {insights.gasEstimate as string}</div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Top Protocols</h3>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Protocol</th>
                <th>TVL</th>
                <th>24h Change</th>
              </tr>
            </thead>
            <tbody>
              {topProtocols?.map((protocol, i) => (
                <tr key={i}>
                  <td className="font-medium">{protocol.name}</td>
                  <td>{protocol.tvl}</td>
                  <td className={protocol.change24h?.startsWith("+") ? "text-success" : "text-error"}>
                    {protocol.change24h}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {networkActivity && (
        <div className="stats stats-vertical md:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-title">Daily Txns</div>
            <div className="stat-value text-lg">{networkActivity.dailyTransactions}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Active Addresses</div>
            <div className="stat-value text-lg">{networkActivity.activeAddresses}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Avg Block Time</div>
            <div className="stat-value text-lg">{networkActivity.avgBlockTime}</div>
          </div>
        </div>
      )}

      <div className="text-xs opacity-60 mt-2">
        <p>Retrieved at: {data.timestamp as string}</p>
        <p>Payment Tx: {data.paymentTx as string}</p>
      </div>
    </div>
  );
};

export default PaidApi;
