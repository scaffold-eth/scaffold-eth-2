import { Address } from "viem";

/**
 * x402 Protocol types for HTTP 402 payment-gated APIs.
 *
 * The x402 protocol flow:
 * 1. Client calls a protected API endpoint
 * 2. Server responds with HTTP 402 and PaymentRequirements in the body
 * 3. Client creates a signed payment authorization (EIP-3009 transferWithAuthorization)
 * 4. Client retries with the payment proof in the X-PAYMENT header
 * 5. Server verifies the payment, settles on-chain, and returns the requested data
 */

export type PaymentRequirements = {
  /** The x402 scheme version */
  x402Version: number;
  /** Array of accepted payment methods */
  accepts: PaymentAccept[];
};

export type PaymentAccept = {
  /** The scheme identifier, e.g. "exact" for exact USDC payment */
  scheme: string;
  /** The network chain ID (e.g. 8453 for Base, 84532 for Base Sepolia) */
  network: string;
  /** Maximum amount in token's smallest unit (e.g. USDC has 6 decimals, so 100000 = $0.10) */
  maxAmountRequired: string;
  /** The ERC-20 token contract address to pay in */
  resource: string;
  /** Additional details about the payment requirement */
  description?: string;
  /** MIME type for the payment payload */
  mimeType?: string;
  /** Address of the payment recipient */
  payTo: string;
  /** Required extra fields for the exact scheme */
  extra: {
    /** The payment recipient (same as payTo, used in EIP-3009) */
    name: string;
    /** Nonce to prevent replay attacks */
    validAfter: string;
    /** Timestamp after which the authorization is no longer valid */
    validBefore: string;
  };
};

export type PaymentPayload = {
  /** The x402 scheme version */
  x402Version: number;
  /** The scheme used for this payment */
  scheme: string;
  /** The network chain ID */
  network: string;
  /** Payment proof data */
  payload: ExactPaymentPayload;
};

export type ExactPaymentPayload = {
  /** The EIP-3009 signature */
  signature: string;
  /** Authorization details for transferWithAuthorization */
  authorization: {
    /** The address paying */
    from: Address;
    /** The address receiving payment */
    to: Address;
    /** The exact amount being authorized */
    value: string;
    /** Timestamp: authorization valid after */
    validAfter: string;
    /** Timestamp: authorization valid before */
    validBefore: string;
    /** Random nonce for replay protection */
    nonce: string;
  };
};

export type X402Config = {
  /** The ERC-20 token address (USDC) */
  tokenAddress: Address;
  /** The payment recipient address */
  payToAddress: Address;
  /** The amount to charge in token's smallest units */
  amount: string;
  /** The chain ID */
  chainId: number;
  /** Human-readable description */
  description?: string;
};
