import { NextResponse } from "next/server";

/**
 * Premium API endpoint — gated by x402 middleware.
 * Clients must include a valid X-PAYMENT header (handled automatically by @x402/fetch).
 * Without payment, the middleware returns HTTP 402 with payment instructions.
 */
export async function GET() {
  // This code only runs after the middleware verifies payment
  const builderData = {
    message: "Welcome to the premium Builder API!",
    data: {
      topBuilders: [
        { address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", builds: 42, reputation: "legendary" },
        { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", builds: 28, reputation: "expert" },
        { address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", builds: 15, reputation: "rising" },
      ],
      totalBuilders: 1337,
      lastUpdated: new Date().toISOString(),
    },
    paidAccess: true,
  };

  return NextResponse.json(builderData);
}
