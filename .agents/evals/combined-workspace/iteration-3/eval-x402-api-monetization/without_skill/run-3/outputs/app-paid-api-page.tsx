"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  CloudIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useX402Payment } from "~~/hooks/x402/useX402Payment";
import { USDC_DECIMALS } from "~~/utils/x402";

const AVAILABLE_CITIES = ["New York", "San Francisco", "Miami", "Chicago", "Denver"];

const PaidApi: NextPage = () => {
  const { isConnected } = useAccount();
  const { callPaidApi, data, isLoading, error, isSuccess, reset } = useX402Payment();
  const [selectedCity, setSelectedCity] = useState<string>("");

  const handleFetchWeather = async () => {
    try {
      const cityParam = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : "";
      await callPaidApi(`/api/paid-weather${cityParam}`);
    } catch {
      // Error is already captured in the hook state
    }
  };

  const formatAmount = (amount: string) => {
    const value = Number(amount) / 10 ** USDC_DECIMALS;
    return `$${value.toFixed(2)} USDC`;
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Payment-Gated API</h1>
          <p className="text-lg text-base-content/70">
            Access premium weather data by paying $0.01 USDC per request using the x402 protocol
          </p>
        </div>

        {/* How it works */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <InformationCircleIcon className="h-6 w-6" />
              How x402 Works
            </h2>
            <div className="steps steps-vertical lg:steps-horizontal w-full">
              <div className="step step-primary">Call API</div>
              <div className="step step-primary">Get 402 + price</div>
              <div className="step step-primary">Sign payment</div>
              <div className="step step-primary">Get data</div>
            </div>
            <p className="text-sm text-base-content/60 mt-2">
              The x402 protocol uses HTTP 402 (Payment Required) to gate API endpoints. Your wallet signs an
              EIP-3009 <code className="text-xs bg-base-300 px-1 rounded">transferWithAuthorization</code> for USDC,
              which the server verifies before returning data. The payment is settled on Base Sepolia.
            </p>
          </div>
        </div>

        {/* API Call Interface */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <CloudIcon className="h-6 w-6" />
              Premium Weather API
            </h2>

            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-primary">
                <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                {formatAmount("10000")} per request
              </span>
              <span className="badge badge-outline">Base Sepolia</span>
              <span className="badge badge-outline">USDC</span>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Select a city (optional - leave empty for all cities)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {AVAILABLE_CITIES.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {!isConnected ? (
              <div className="alert alert-warning">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Please connect your wallet to use the paid API</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  className={`btn btn-primary flex-1 ${isLoading ? "loading" : ""}`}
                  onClick={handleFetchWeather}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <CurrencyDollarIcon className="h-5 w-5" />
                  )}
                  {isLoading ? "Processing Payment..." : "Pay & Fetch Weather Data"}
                </button>
                {(data || error) && (
                  <button className="btn btn-ghost" onClick={reset}>
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <div>
              <h3 className="font-bold">Payment Error</h3>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Response Display */}
        {isSuccess && data && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title text-success">Payment Successful - Data Retrieved</h2>

              {data.data && !Array.isArray(data.data) ? (
                // Single city response
                <WeatherCard weather={data.data} />
              ) : data.data && Array.isArray(data.data) ? (
                // All cities response
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.data.map((weather: any) => (
                    <WeatherCard key={weather.city} weather={weather} />
                  ))}
                </div>
              ) : null}

              <div className="mt-4 text-xs text-base-content/50">
                <p>Timestamp: {data.timestamp}</p>
                <p>Paid Access: {data.paidAccess ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Raw Response */}
        {isSuccess && data && (
          <div className="collapse collapse-arrow bg-base-100 shadow-xl mb-6">
            <input type="checkbox" />
            <div className="collapse-title font-medium">View Raw API Response</div>
            <div className="collapse-content">
              <pre className="bg-base-300 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* API Documentation */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">API Documentation</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Cost</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code className="text-xs bg-base-300 px-1 rounded">/api/paid-weather</code>
                    </td>
                    <td>GET</td>
                    <td>$0.01 USDC</td>
                    <td>Get weather for all cities</td>
                  </tr>
                  <tr>
                    <td>
                      <code className="text-xs bg-base-300 px-1 rounded">/api/paid-weather?city=Miami</code>
                    </td>
                    <td>GET</td>
                    <td>$0.01 USDC</td>
                    <td>Get weather for a specific city</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Integration Example</h3>
              <pre className="bg-base-300 p-4 rounded-lg overflow-auto text-xs">{`// Using the useX402Payment hook
import { useX402Payment } from "~~/hooks/x402/useX402Payment";

const { callPaidApi, data, isLoading } = useX402Payment();

// The hook handles the full payment flow automatically
const weather = await callPaidApi("/api/paid-weather?city=Miami");`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Renders weather data for a single city */
function WeatherCard({ weather }: { weather: any }) {
  return (
    <div className="card bg-base-200 compact">
      <div className="card-body">
        <h3 className="card-title text-lg">{weather.city}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Temperature:</span> {weather.temperature}&deg;{weather.unit}
          </div>
          <div>
            <span className="font-semibold">Condition:</span> {weather.condition}
          </div>
          <div>
            <span className="font-semibold">Humidity:</span> {weather.humidity}%
          </div>
          <div>
            <span className="font-semibold">Wind:</span> {weather.windSpeed} mph {weather.windDirection}
          </div>
          <div>
            <span className="font-semibold">UV Index:</span> {weather.uvIndex}
          </div>
          <div>
            <span className="font-semibold">Visibility:</span> {weather.visibility} mi
          </div>
        </div>
        <p className="text-sm text-base-content/70 mt-1">
          <span className="font-semibold">Forecast:</span> {weather.forecast}
        </p>
      </div>
    </div>
  );
}

export default PaidApi;
