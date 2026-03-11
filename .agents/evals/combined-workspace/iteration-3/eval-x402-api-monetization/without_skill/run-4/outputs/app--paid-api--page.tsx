"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp?: string;
  paymentRequired?: boolean;
  paymentDetails?: {
    price: string;
    network: string;
    description: string;
  };
};

type PaymentRequirements = {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  description: string;
  payTo: string;
  asset: string;
};

const ApiEndpointCard = ({
  title,
  description,
  endpoint,
  price,
  queryParam,
}: {
  title: string;
  description: string;
  endpoint: string;
  price: string;
  queryParam?: { key: string; placeholder: string };
}) => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentRequirements | null>(null);
  const [loading, setLoading] = useState(false);
  const [queryValue, setQueryValue] = useState("");

  const callApi = async () => {
    setLoading(true);
    setResponse(null);
    setPaymentInfo(null);

    try {
      const url = queryParam && queryValue ? `${endpoint}?${queryParam.key}=${encodeURIComponent(queryValue)}` : endpoint;

      const res = await fetch(url);

      if (res.status === 402) {
        // Payment required - parse the x402 payment requirements
        const x402Header = res.headers.get("x-402-payment");
        if (x402Header) {
          try {
            const requirements = JSON.parse(atob(x402Header));
            if (Array.isArray(requirements) && requirements.length > 0) {
              setPaymentInfo(requirements[0]);
            }
          } catch {
            // Header might not be base64 JSON, try direct JSON
            try {
              const requirements = JSON.parse(x402Header);
              setPaymentInfo(requirements);
            } catch {
              // Could not parse payment header
            }
          }
        }

        setResponse({
          success: false,
          paymentRequired: true,
          paymentDetails: {
            price,
            network: "Base Sepolia",
            description,
          },
        });
      } else {
        const data = await res.json();
        setResponse(data);
      }
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : "Failed to call API",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <CurrencyDollarIcon className="h-6 w-6 text-primary" />
          {title}
        </h2>
        <p className="text-sm opacity-70">{description}</p>

        <div className="flex items-center gap-2 mt-2">
          <span className="badge badge-primary badge-outline">GET</span>
          <code className="text-xs bg-base-200 px-2 py-1 rounded">{endpoint}</code>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="badge badge-secondary badge-sm">Price: {price} USDC</span>
          <span className="badge badge-accent badge-sm">Base Sepolia</span>
        </div>

        {queryParam && (
          <div className="form-control mt-3">
            <label className="label">
              <span className="label-text text-sm">{queryParam.key} (optional)</span>
            </label>
            <input
              type="text"
              placeholder={queryParam.placeholder}
              className="input input-bordered input-sm w-full"
              value={queryValue}
              onChange={e => setQueryValue(e.target.value)}
            />
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <button className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`} onClick={callApi} disabled={loading}>
            {loading ? "Calling..." : "Try API Call"}
          </button>
        </div>

        {response && (
          <div className="mt-4">
            {response.paymentRequired ? (
              <div className="alert alert-warning">
                <div>
                  <h3 className="font-bold">402 Payment Required</h3>
                  <p className="text-sm mt-1">
                    This endpoint requires a micropayment of {response.paymentDetails?.price} USDC on{" "}
                    {response.paymentDetails?.network} to access.
                  </p>
                  {paymentInfo && (
                    <div className="mt-2 text-xs bg-base-200 p-2 rounded">
                      <p>
                        <strong>Pay to:</strong> {paymentInfo.payTo}
                      </p>
                      <p>
                        <strong>Network:</strong> {paymentInfo.network}
                      </p>
                      <p>
                        <strong>Amount:</strong> {paymentInfo.maxAmountRequired} (atomic units)
                      </p>
                    </div>
                  )}
                  <p className="text-xs mt-2 opacity-70">
                    Use an x402-compatible client (e.g., @x402/fetch) to automatically handle payment and access this
                    endpoint.
                  </p>
                </div>
              </div>
            ) : response.success ? (
              <div className="bg-base-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-success mb-1">200 OK</p>
                <pre className="text-xs overflow-auto max-h-48">{JSON.stringify(response.data, null, 2)}</pre>
                {response.timestamp && (
                  <p className="text-xs opacity-50 mt-1">Timestamp: {response.timestamp}</p>
                )}
              </div>
            ) : (
              <div className="alert alert-error">
                <p className="text-sm">{response.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PaidApi: NextPage = () => {
  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Paid API Endpoints</h1>
          <p className="text-lg opacity-70">
            Monetize your API with micropayments using the x402 protocol. Each call costs a fraction of a cent in USDC.
          </p>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <div className="badge badge-lg badge-outline gap-1">
              <CurrencyDollarIcon className="h-4 w-4" />
              USDC Payments
            </div>
            <div className="badge badge-lg badge-outline">Base Sepolia Testnet</div>
            <div className="badge badge-lg badge-outline">x402 Protocol</div>
          </div>
        </div>

        <div className="divider">Available Endpoints</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ApiEndpointCard
            title="Weather API"
            description="Get real-time weather data for major cities worldwide. Returns temperature, conditions, humidity, and wind data."
            endpoint="/api/weather"
            price="0.001"
            queryParam={{ key: "city", placeholder: "e.g., New York, London, Tokyo" }}
          />

          <ApiEndpointCard
            title="Joke API"
            description="Get a random developer or crypto joke. Perfect for adding humor to your apps."
            endpoint="/api/joke"
            price="0.001"
          />
        </div>

        <div className="divider">How It Works</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body items-center text-center">
              <div className="text-3xl font-bold text-primary">1</div>
              <h3 className="card-title text-sm">Call the API</h3>
              <p className="text-xs opacity-70">
                Make a standard HTTP GET request to any paid endpoint. Without payment, you will receive a 402 status
                code.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body items-center text-center">
              <div className="text-3xl font-bold text-primary">2</div>
              <h3 className="card-title text-sm">Sign Payment</h3>
              <p className="text-xs opacity-70">
                Use an x402-compatible client to automatically sign a USDC payment authorization on Base Sepolia.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body items-center text-center">
              <div className="text-3xl font-bold text-primary">3</div>
              <h3 className="card-title text-sm">Get Response</h3>
              <p className="text-xs opacity-70">
                The payment is settled on-chain and you receive the API response. Payment is only charged for successful
                responses.
              </p>
            </div>
          </div>
        </div>

        <div className="divider">Integration Guide</div>

        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-lg">Using x402-compatible clients</h2>
            <p className="text-sm opacity-70 mb-3">
              To programmatically access paid endpoints, use an x402 client library that handles the payment flow
              automatically:
            </p>

            <div className="mockup-code text-xs">
              <pre data-prefix="$">
                <code>npm install @x402/fetch @x402/evm viem</code>
              </pre>
            </div>

            <div className="bg-base-200 rounded-lg p-4 mt-3">
              <p className="text-xs font-mono whitespace-pre-wrap">{`import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

// Set up the x402 client with your wallet
const signer = privateKeyToAccount(process.env.EVM_PRIVATE_KEY);
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));

// Wrap fetch with automatic payment handling
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// Make paid API calls - payment is handled automatically
const response = await fetchWithPayment(
  "https://your-app.vercel.app/api/weather?city=London"
);
const data = await response.json();
console.log(data);`}</p>
            </div>

            <div className="mt-4 text-sm">
              <h3 className="font-semibold mb-2">Environment Variables Required</h3>
              <div className="bg-base-200 rounded-lg p-3">
                <p className="text-xs font-mono">
                  <span className="text-primary">X402_PAYTO_ADDRESS</span>=0xYourWalletAddress
                  <br />
                  <span className="opacity-60"># The wallet address that receives USDC micropayments</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaidApi;
