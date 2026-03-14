import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { X402_PAY_TO, x402FacilitatorConfig, x402RouteConfig } from "~~/utils/x402/config";

/**
 * Premium data API endpoint protected by x402 micropayments.
 *
 * When called without a valid payment header, returns HTTP 402 with payment requirements.
 * When called with a valid x402 payment header, returns the premium data and the
 * facilitator settles the USDC payment to the configured payTo address.
 */
const handler = async (_request: NextRequest) => {
  // Simulated premium on-chain analytics data
  const premiumData = {
    timestamp: new Date().toISOString(),
    analytics: {
      totalTransactions24h: 1_243_567,
      averageGasPrice: "12.4 gwei",
      topContracts: [
        { name: "Uniswap V3 Router", calls: 89_432, gasUsed: "234.5 ETH" },
        { name: "OpenSea Seaport", calls: 45_221, gasUsed: "123.1 ETH" },
        { name: "USDC Transfer", calls: 34_112, gasUsed: "45.2 ETH" },
      ],
      defiMetrics: {
        totalValueLocked: "$48.2B",
        dailyVolume: "$3.1B",
        activeProtocols: 892,
      },
      networkHealth: {
        blockTime: "12.1s",
        pendingTransactions: 4_521,
        validatorCount: 1_002_345,
      },
    },
    message: "This premium data was accessed via x402 micropayment.",
  };

  return NextResponse.json(premiumData);
};

export const GET = withX402(handler, X402_PAY_TO, x402RouteConfig, x402FacilitatorConfig);
