import { Address } from "viem";

/**
 * x402 Protocol constants
 */

/** Current x402 protocol version */
export const X402_VERSION = 1;

/** The x402 payment header name */
export const X402_PAYMENT_HEADER = "X-PAYMENT";

/** The "exact" scheme identifier for direct USDC payments */
export const X402_SCHEME_EXACT = "exact";

/** USDC contract addresses on supported chains */
export const USDC_ADDRESSES: Record<number, Address> = {
  // Base Mainnet
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  // Base Sepolia
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  // Ethereum Mainnet
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  // Sepolia
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
};

/** USDC has 6 decimals */
export const USDC_DECIMALS = 6;

/** Default payment amount: $0.01 USDC (10000 = 0.01 * 10^6) */
export const DEFAULT_PAYMENT_AMOUNT = "10000";

/**
 * Default chain for x402 payments.
 * Base Sepolia is used by default for development/testing.
 */
export const DEFAULT_X402_CHAIN_ID = 84532;

/**
 * EIP-3009 transferWithAuthorization function ABI.
 * This is the standard used by USDC for gasless authorized transfers.
 */
export const TRANSFER_WITH_AUTHORIZATION_ABI = [
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
      { name: "signature", type: "bytes" },
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * EIP-712 domain type for USDC's transferWithAuthorization (EIP-3009).
 * This domain is used to create typed data signatures for USDC payments.
 */
export const EIP3009_DOMAIN_TYPE = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;
