import { NextResponse } from "next/server";

// Sample premium builder data — this is the monetized content
const BUILDER_DATA = {
  builders: [
    {
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      name: "vitalik.eth",
      builds: 42,
      reputation: 99,
      specialties: ["DeFi", "Layer 2", "Account Abstraction"],
    },
    {
      address: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
      name: "austingriffith.eth",
      builds: 128,
      reputation: 100,
      specialties: ["Education", "Public Goods", "Scaffold-ETH"],
    },
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      name: "builder3.eth",
      builds: 17,
      reputation: 85,
      specialties: ["NFTs", "Gaming", "Social"],
    },
  ],
  totalBuilders: 3,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  // If the request reaches this handler, payment was already verified by x402 middleware.
  // The middleware intercepts requests without valid payment and returns 402.
  return NextResponse.json({
    success: true,
    data: BUILDER_DATA,
    meta: {
      paymentRequired: true,
      price: "$0.01 USDC",
      network: "Base Sepolia",
    },
  });
}
