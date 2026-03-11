import { NextResponse } from "next/server";

// Sample premium builder data — this is the monetized resource
const BUILDER_DATA = {
  builders: [
    {
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      name: "vitalik.eth",
      builds: 42,
      reputation: 99,
      specialties: ["Smart Contracts", "Protocol Design", "EIPs"],
    },
    {
      address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b",
      name: "builder-alice.eth",
      builds: 28,
      reputation: 95,
      specialties: ["DeFi", "AMMs", "Yield Optimization"],
    },
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      name: "builder-bob.eth",
      builds: 15,
      reputation: 88,
      specialties: ["NFTs", "Gaming", "Layer 2"],
    },
  ],
  totalBuilders: 3,
  lastUpdated: new Date().toISOString(),
  note: "This premium data was accessed via x402 micropayment. You paid $0.01 USDC.",
};

export async function GET() {
  // If we reach this handler, the x402 middleware has already verified payment.
  // The middleware intercepts requests without valid X-PAYMENT headers and
  // returns 402 Payment Required. Only paid requests make it here.
  return NextResponse.json(BUILDER_DATA);
}
