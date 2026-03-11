/**
 * Types for the x402 payment protocol.
 *
 * The x402 protocol enables HTTP 402 Payment Required responses
 * with standardized payment negotiation for API monetization.
 */

/** Payment requirements returned in a 402 response */
export type PaymentRequirements = {
  /** Version of the x402 protocol */
  x402Version: number;
  /** Array of accepted payment schemes */
  accepts: PaymentScheme[];
};

/** A single accepted payment scheme */
export type PaymentScheme = {
  /** The payment scheme identifier (e.g., "exact") */
  scheme: string;
  /** The network/chain for the payment */
  network: string;
  /** The chain ID as a decimal string */
  chainId: string;
  /** Maximum amount in the token's smallest unit */
  maxAmountRequired: string;
  /** The resource being purchased */
  resource: string;
  /** Payment description */
  description: string;
  /** MIME type of the paid content */
  mimeType: string;
  /** Token address for payment (e.g., USDC) */
  payToAddress: string;
  /** The ERC-20 token contract address */
  requiredPaymentToken: string;
  /** Deadline (unix timestamp) by which payment must arrive */
  requiredDeadline: string;
  /** Additional outputs/metadata */
  extra: Record<string, string>;
};

/** Payment payload sent in X-PAYMENT header */
export type PaymentPayload = {
  /** The x402 protocol version */
  x402Version: number;
  /** The payment scheme used */
  scheme: string;
  /** The network the payment was made on */
  network: string;
  /** The chain ID */
  chainId: string;
  /** The payment details */
  payload: {
    /** The transaction hash of the USDC transfer */
    txHash: string;
    /** The chain ID (number) */
    chainId: number;
  };
};

/** Server-side payment verification result */
export type PaymentVerificationResult = {
  valid: boolean;
  errorMessage?: string;
  txHash?: string;
};

/** Response from the paid API */
export type PaidApiResponse = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};
