import { type Address } from "viem";

/**
 * x402 payment configuration for API monetization.
 *
 * The payTo address receives USDC micropayments when users access protected endpoints.
 * Set NEXT_PUBLIC_X402_PAY_TO in your .env.local to your own wallet address.
 *
 * The facilitator URL points to the service that verifies and settles payments.
 * The default (x402.org) works for testnet; use your own facilitator for production.
 */

export const X402_PAY_TO = (process.env.NEXT_PUBLIC_X402_PAY_TO || "0x0000000000000000000000000000000000000000") as Address;

export const X402_NETWORK = (process.env.NEXT_PUBLIC_X402_NETWORK || "base-sepolia") as "base-sepolia" | "base";

export const X402_PRICE = process.env.NEXT_PUBLIC_X402_PRICE || "$0.01";

export const X402_FACILITATOR_URL = process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || "https://x402.org/facilitator";

export const x402RouteConfig = {
  price: X402_PRICE,
  network: X402_NETWORK,
  config: {
    description: "Access premium on-chain analytics data",
  },
} as const;

export const x402FacilitatorConfig = {
  url: X402_FACILITATOR_URL,
};
