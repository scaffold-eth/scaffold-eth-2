import { baseSepolia } from "viem/chains";

/**
 * Configuration for x402 payment-gated API routes.
 *
 * The x402 protocol uses HTTP 402 (Payment Required) status codes
 * to gate API access behind cryptocurrency micropayments.
 */
export const x402Config = {
  /** The chain where payments are processed */
  chain: baseSepolia,

  /** USDC token contract address on Base Sepolia */
  usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const,

  /**
   * The address that receives USDC payments.
   * Set this to your own address via NEXT_PUBLIC_X402_RECIPIENT env var,
   * or it defaults to the zero address (update before going live).
   */
  recipientAddress: (process.env.NEXT_PUBLIC_X402_RECIPIENT ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,

  /** Price in USDC (human-readable). 0.01 USDC = 1 cent per API call */
  priceUSDC: "0.01",

  /** USDC has 6 decimals */
  usdcDecimals: 6,

  /** Payment validity window in seconds (5 minutes) */
  paymentValiditySeconds: 300,

  /** Resource identifier for the paid endpoint */
  resource: "/api/paid-data",
} as const;

/** USDC ERC-20 ABI (subset needed for transfers and approvals) */
export const USDC_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;
