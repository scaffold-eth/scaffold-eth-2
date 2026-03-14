"use client";

import type { NextPage } from "next";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

/**
 * Premium builder page — gated by x402 paywall.
 * When visited in a browser, the x402 middleware intercepts and shows a paywall UI.
 * After the user pays (USDC on Base Sepolia), this page content is revealed.
 */
const BuilderPage: NextPage = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <CurrencyDollarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Premium Builder Dashboard</h1>
        </div>

        <div className="alert alert-success mb-6">
          <span>Payment verified! You now have access to this premium content.</span>
        </div>

        <div className="grid gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Top Builders</h2>
              <p className="text-sm opacity-70">Exclusive leaderboard data, paid via x402 micropayment.</p>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Builder</th>
                      <th>Builds</th>
                      <th>Reputation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td className="font-mono text-sm">0xd8da...6045</td>
                      <td>42</td>
                      <td>
                        <span className="badge badge-primary">Legendary</span>
                      </td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td className="font-mono text-sm">0x71C7...976F</td>
                      <td>28</td>
                      <td>
                        <span className="badge badge-secondary">Expert</span>
                      </td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td className="font-mono text-sm">0xAb58...C9B</td>
                      <td>15</td>
                      <td>
                        <span className="badge badge-accent">Rising</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">How x402 Works</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>You visited this page and the x402 middleware intercepted the request.</li>
                <li>A paywall UI prompted you to authorize a $0.01 USDC payment on Base Sepolia.</li>
                <li>
                  You signed an EIP-712 message — no transaction sent from your wallet. The facilitator settles
                  payment.
                </li>
                <li>After verification, this content was served and the payment was settled onchain.</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">API Access</h2>
              <p className="text-sm">
                The same data is available programmatically at{" "}
                <code className="bg-base-300 px-2 py-1 rounded text-sm">/api/payment/builder</code>. Use{" "}
                <code className="bg-base-300 px-2 py-1 rounded text-sm">@x402/fetch</code> in your scripts to pay
                automatically.
              </p>
              <p className="text-sm mt-2">
                Test with: <code className="bg-base-300 px-2 py-1 rounded text-sm">yarn send402request</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
