import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";

// Force Node.js runtime for x402 payment verification
export const runtime = "nodejs";

// The address that will receive USDC micropayments.
// Set via PAYMENT_RECEIVER_ADDRESS env var, or defaults to a placeholder.
const PAYMENT_RECEIVER_ADDRESS = (process.env.PAYMENT_RECEIVER_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Price in USD (USDC) charged per request
const PRICE_PER_REQUEST = "$0.001";

// Network where payments are settled
const PAYMENT_NETWORK = "base-sepolia" as const;

// The actual API handler that serves data once payment is confirmed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async (_request: NextRequest) => {
  const data = {
    timestamp: new Date().toISOString(),
    blockchainMetrics: {
      ethPrice: (2000 + Math.random() * 500).toFixed(2),
      gasPrice: (10 + Math.random() * 40).toFixed(1),
      activeValidators: Math.floor(800000 + Math.random() * 50000),
      totalTransactions24h: Math.floor(1000000 + Math.random() * 200000),
      avgBlockTime: (12 + Math.random() * 0.5).toFixed(2),
    },
    defiMetrics: {
      totalTvl: `$${(150 + Math.random() * 50).toFixed(1)}B`,
      topProtocols: [
        { name: "Lido", tvl: `$${(30 + Math.random() * 5).toFixed(1)}B` },
        { name: "Aave", tvl: `$${(15 + Math.random() * 3).toFixed(1)}B` },
        { name: "MakerDAO", tvl: `$${(10 + Math.random() * 2).toFixed(1)}B` },
        { name: "Uniswap", tvl: `$${(5 + Math.random() * 1).toFixed(1)}B` },
      ],
      volume24h: `$${(3 + Math.random() * 2).toFixed(1)}B`,
    },
    message: "This premium data was served after x402 payment verification.",
  };

  return NextResponse.json(data);
};

// Wrap the handler with x402 payment gate.
// The facilitator defaults to x402.org for testnet usage.
export const GET = withX402(handler, PAYMENT_RECEIVER_ADDRESS, {
  price: PRICE_PER_REQUEST,
  network: PAYMENT_NETWORK,
  config: {
    description: "Premium blockchain analytics data",
  },
});
