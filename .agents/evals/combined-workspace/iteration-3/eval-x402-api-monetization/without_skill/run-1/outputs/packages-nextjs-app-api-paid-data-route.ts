import { NextRequest, NextResponse } from "next/server";
import { buildPaymentRequirements, verifyPayment } from "~~/utils/x402";

/**
 * Payment-gated API endpoint using the x402 protocol.
 *
 * Flow:
 * 1. Client sends GET request
 * 2. If no X-PAYMENT header, server responds with 402 + payment requirements
 * 3. If X-PAYMENT header present, server verifies the payment on-chain
 * 4. If payment is valid, server returns the premium data
 *
 * The X-PAYMENT header contains a base64-encoded JSON payload with the
 * transaction hash of the USDC transfer that pays for the API call.
 */
export async function GET(request: NextRequest) {
  const paymentHeader = request.headers.get("X-PAYMENT");

  // No payment provided: respond with 402 and payment requirements
  if (!paymentHeader) {
    const paymentRequirements = buildPaymentRequirements();

    return NextResponse.json(paymentRequirements, {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT-REQUIRED": "true",
      },
    });
  }

  // Payment provided: verify it on-chain
  const verification = await verifyPayment(paymentHeader);

  if (!verification.valid) {
    return NextResponse.json(
      {
        success: false,
        error: verification.errorMessage || "Payment verification failed",
      },
      { status: 402 },
    );
  }

  // Payment verified! Return premium data
  const premiumData = {
    success: true,
    data: {
      message: "Access granted! Here is your premium data.",
      timestamp: new Date().toISOString(),
      paymentTx: verification.txHash,
      marketInsights: {
        ethereumTrend: "bullish",
        gasEstimate: "12 gwei",
        topProtocols: [
          { name: "Uniswap", tvl: "$5.2B", change24h: "+3.4%" },
          { name: "Aave", tvl: "$12.1B", change24h: "+1.2%" },
          { name: "Lido", tvl: "$15.8B", change24h: "-0.5%" },
        ],
        networkActivity: {
          dailyTransactions: "1.2M",
          activeAddresses: "450K",
          avgBlockTime: "12.1s",
        },
      },
    },
  };

  return NextResponse.json(premiumData, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
