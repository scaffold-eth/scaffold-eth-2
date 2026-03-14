// x402 payment protocol configuration
// Used by both the server-side middleware and client-side hooks

// The address that receives USDC micropayments
export const PAYMENT_RECEIVER_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS ||
  process.env.PAYMENT_RECEIVER_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Default price per API request in USD (USDC)
export const DEFAULT_PRICE = "$0.001";

// Network for payment settlement
export const PAYMENT_NETWORK = "base-sepolia" as const;

// The default x402 facilitator URL (testnet)
export const FACILITATOR_URL = "https://x402.org/facilitator";

// Paid API endpoint path
export const PAID_API_PATH = "/api/paid-data";
