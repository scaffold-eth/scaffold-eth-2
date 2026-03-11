"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

const PaidApi: NextPage = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const callPaidApi = async () => {
    setIsLoading(true);
    setResponse(null);
    setStatus(null);

    try {
      const res = await fetch("/api/payment/builder");
      setStatus(res.status);

      if (res.status === 402) {
        // Extract payment requirements from the response
        const paymentRequired = res.headers.get("PAYMENT-REQUIRED");
        setResponse(
          JSON.stringify(
            {
              error: "Payment Required (HTTP 402)",
              info: "This endpoint requires a USDC micropayment to access.",
              paymentHeader: paymentRequired ? "Present (base64-encoded)" : "Not found",
              howToTest: "Use `yarn send402request` from the CLI with a funded Base Sepolia wallet.",
            },
            null,
            2,
          ),
        );
      } else {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setResponse(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-3xl">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">x402 Payment-Gated API</span>
          <span className="block text-4xl font-bold">Paid API Demo</span>
        </h1>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <CurrencyDollarIcon className="h-6 w-6" />
              How it works
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                The API endpoint at <code className="bg-base-300 px-1 rounded">/api/payment/builder</code> is protected
                by x402 middleware.
              </li>
              <li>
                Without a valid payment header, the server responds with HTTP <strong>402 Payment Required</strong>.
              </li>
              <li>
                Programmatic clients use <code className="bg-base-300 px-1 rounded">@x402/fetch</code> to automatically
                sign a USDC payment and retry the request.
              </li>
              <li>
                Each request costs <strong>$0.01 USDC</strong> on Base Sepolia.
              </li>
            </ul>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Test the API</h2>
            <p className="text-sm mb-4">
              Click the button below to call the protected endpoint. Without a payment header, you will see a 402
              response. To make a paid request, use <code className="bg-base-300 px-1 rounded">yarn send402request</code>{" "}
              from the CLI.
            </p>
            <button className={`btn btn-primary ${isLoading ? "loading" : ""}`} onClick={callPaidApi} disabled={isLoading}>
              {isLoading ? "Calling..." : "Call /api/payment/builder"}
            </button>

            {status !== null && (
              <div className="mt-4">
                <div className={`badge ${status === 200 ? "badge-success" : "badge-warning"} mb-2`}>
                  HTTP {status}
                </div>
                <pre className="bg-base-300 p-4 rounded-lg overflow-auto text-sm max-h-96">{response}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">CLI Testing</h2>
            <p className="text-sm mb-2">To test with a real payment from the command line:</p>
            <div className="mockup-code text-sm">
              <pre data-prefix="1">
                <code>yarn generate</code>
              </pre>
              <pre data-prefix="2" className="text-warning">
                <code># Fund the generated wallet with test USDC from faucet.circle.com</code>
              </pre>
              <pre data-prefix="3">
                <code>yarn send402request</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaidApi;
