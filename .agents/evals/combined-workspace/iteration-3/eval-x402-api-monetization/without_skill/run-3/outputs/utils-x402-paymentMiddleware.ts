import { NextResponse } from "next/server";
import {
  DEFAULT_PAYMENT_AMOUNT,
  DEFAULT_X402_CHAIN_ID,
  USDC_ADDRESSES,
  X402_PAYMENT_HEADER,
  X402_SCHEME_EXACT,
  X402_VERSION,
} from "./constants";
import { settlePayment, verifyPayment } from "./paymentVerifier";
import { PaymentRequirements, X402Config } from "./types";

/**
 * Creates an x402 payment-gated API handler.
 *
 * Wraps a standard Next.js route handler with x402 payment verification.
 * If no valid payment is provided, responds with HTTP 402 Payment Required
 * and the payment requirements. If a valid payment is provided in the
 * X-PAYMENT header, verifies and settles the payment, then calls the
 * original handler.
 *
 * @param handler - The original route handler function
 * @param options - Configuration for the payment gate
 * @returns A wrapped route handler with x402 payment gating
 */
export function withX402Payment(
  handler: (request: Request) => Promise<NextResponse>,
  options?: Partial<X402Config>,
) {
  const chainId = options?.chainId || DEFAULT_X402_CHAIN_ID;
  const payToAddress = options?.payToAddress || (process.env.X402_PAYMENT_RECIPIENT as `0x${string}`);
  const tokenAddress = options?.tokenAddress || USDC_ADDRESSES[chainId];
  const amount = options?.amount || process.env.X402_PAYMENT_AMOUNT || DEFAULT_PAYMENT_AMOUNT;
  const description = options?.description || "Payment required to access this API endpoint";

  if (!payToAddress) {
    console.error("[x402] No payment recipient configured. Set X402_PAYMENT_RECIPIENT env var.");
  }

  if (!tokenAddress) {
    console.error(`[x402] USDC address not found for chain ${chainId}`);
  }

  const config: X402Config = {
    tokenAddress: tokenAddress!,
    payToAddress: payToAddress!,
    amount,
    chainId,
    description,
  };

  return async function x402Handler(request: Request): Promise<NextResponse> {
    // Check for payment header
    const paymentHeader = request.headers.get(X402_PAYMENT_HEADER);

    if (!paymentHeader) {
      // No payment provided - respond with 402 and payment requirements
      return createPaymentRequiredResponse(config);
    }

    // Verify the payment
    const verification = await verifyPayment(paymentHeader, config);

    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: verification.error,
        },
        { status: 402 },
      );
    }

    // Settle the payment on-chain
    const settlement = await settlePayment(verification.payload, chainId);

    if (!settlement.settled) {
      return NextResponse.json(
        {
          error: "Payment settlement failed",
          details: settlement.error,
        },
        { status: 402 },
      );
    }

    // Payment verified and settled - call the original handler
    // Add payment info to response headers for transparency
    const response = await handler(request);

    response.headers.set("X-PAYMENT-SETTLED", "true");
    if (settlement.txHash) {
      response.headers.set("X-PAYMENT-TX", settlement.txHash);
    }

    return response;
  };
}

/**
 * Creates the HTTP 402 Payment Required response with x402 payment requirements.
 */
function createPaymentRequiredResponse(config: X402Config): NextResponse {
  const now = Math.floor(Date.now() / 1000);

  const paymentRequirements: PaymentRequirements = {
    x402Version: X402_VERSION,
    accepts: [
      {
        scheme: X402_SCHEME_EXACT,
        network: String(config.chainId),
        maxAmountRequired: config.amount,
        resource: config.tokenAddress,
        description: config.description,
        mimeType: "application/json",
        payTo: config.payToAddress,
        extra: {
          name: "USD Coin",
          validAfter: String(now),
          validBefore: String(now + 3600), // 1 hour validity
        },
      },
    ],
  };

  return NextResponse.json(paymentRequirements, {
    status: 402,
    headers: {
      "X-PAYMENT-VERSION": String(X402_VERSION),
    },
  });
}
