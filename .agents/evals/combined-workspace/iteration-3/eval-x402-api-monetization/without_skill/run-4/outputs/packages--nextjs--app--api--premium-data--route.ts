import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { server } from "~~/x402.config";

const PAYTO_ADDRESS = process.env.X402_PAYTO_ADDRESS as `0x${string}`;

/**
 * Premium data handler that returns market analytics.
 * Payment is settled only after a successful response (status < 400).
 */
const handler = async (_req: NextRequest) => {
  const data = {
    timestamp: new Date().toISOString(),
    market: {
      ethPrice: "$3,847.21",
      ethChange24h: "+2.4%",
      gasPrice: "12 gwei",
      topGainers: [
        { token: "UNI", change: "+8.2%" },
        { token: "AAVE", change: "+5.7%" },
        { token: "LDO", change: "+4.1%" },
      ],
      topLosers: [
        { token: "DOGE", change: "-3.1%" },
        { token: "SHIB", change: "-2.8%" },
        { token: "PEPE", change: "-1.9%" },
      ],
    },
    defi: {
      totalTvl: "$48.2B",
      topProtocols: [
        { name: "Lido", tvl: "$14.2B" },
        { name: "Aave", tvl: "$11.8B" },
        { name: "Uniswap", tvl: "$5.1B" },
      ],
    },
    sentiment: {
      fearGreedIndex: 72,
      label: "Greed",
      recommendation: "Market is showing bullish sentiment. Consider taking partial profits on positions up >50%.",
    },
  };

  return NextResponse.json({ success: true, data }, { status: 200 });
};

/**
 * GET /api/premium-data
 *
 * x402-protected endpoint that charges $0.001 USDC per request on Base Sepolia.
 * The withX402 wrapper handles payment verification and settlement automatically.
 */
export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:84532", // Base Sepolia
        payTo: PAYTO_ADDRESS,
      },
    ],
    description: "Premium crypto market analytics and DeFi data",
    mimeType: "application/json",
  },
  server,
);
