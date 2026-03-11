import { NextResponse } from "next/server";

/**
 * Premium builder leaderboard API endpoint.
 * Protected by x402 middleware — requires a $0.01 USDC micropayment.
 * The middleware handles 402 responses and payment verification automatically.
 */
export async function GET() {
  const leaderboard = {
    title: "Top Builders Leaderboard",
    updatedAt: new Date().toISOString(),
    builders: [
      {
        rank: 1,
        address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        username: "vitalik.eth",
        reputation: 9850,
        projectsShipped: 42,
      },
      {
        rank: 2,
        address: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
        username: "austingriffith.eth",
        reputation: 9720,
        projectsShipped: 38,
      },
      {
        rank: 3,
        address: "0x1234567890abcdef1234567890abcdef12345678",
        username: "builder3.eth",
        reputation: 9500,
        projectsShipped: 31,
      },
      {
        rank: 4,
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        username: "builder4.eth",
        reputation: 9200,
        projectsShipped: 27,
      },
      {
        rank: 5,
        address: "0x9876543210fedcba9876543210fedcba98765432",
        username: "builder5.eth",
        reputation: 8900,
        projectsShipped: 24,
      },
    ],
  };

  return NextResponse.json(leaderboard);
}
