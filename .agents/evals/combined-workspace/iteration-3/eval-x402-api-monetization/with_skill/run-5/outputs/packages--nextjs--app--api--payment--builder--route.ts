import { NextResponse } from "next/server";

// This route is protected by x402 middleware.
// Clients must include a valid X-PAYMENT header (signed USDC authorization)
// to access this data. Without payment, the middleware returns HTTP 402.
export async function GET() {
  const builderData = {
    message: "Welcome to the premium builder API!",
    timestamp: new Date().toISOString(),
    builders: [
      {
        name: "Alice",
        specialty: "Smart Contracts",
        projectsCompleted: 42,
        rating: 4.9,
      },
      {
        name: "Bob",
        specialty: "Frontend DApps",
        projectsCompleted: 38,
        rating: 4.8,
      },
      {
        name: "Charlie",
        specialty: "DeFi Protocols",
        projectsCompleted: 27,
        rating: 4.7,
      },
    ],
    meta: {
      totalBuilders: 3,
      averageRating: 4.8,
      costPerRequest: "$0.01 USDC",
    },
  };

  return NextResponse.json(builderData);
}
