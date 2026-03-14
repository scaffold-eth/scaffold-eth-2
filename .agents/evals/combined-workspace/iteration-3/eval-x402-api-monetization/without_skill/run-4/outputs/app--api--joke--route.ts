import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import type { Address } from "viem";

const RESOURCE_PAYTO_ADDRESS = (process.env.X402_PAYTO_ADDRESS || "0xYourAddressHere") as Address;

const JOKES = [
  { id: 1, joke: "Why do programmers prefer dark mode? Because light attracts bugs.", category: "programming" },
  { id: 2, joke: "Why did the blockchain developer quit? Too many unresolved forks.", category: "crypto" },
  {
    id: 3,
    joke: "A SQL query walks into a bar, sees two tables, and asks... 'Can I JOIN you?'",
    category: "programming",
  },
  { id: 4, joke: "Why did Ethereum go to therapy? It had too much gas.", category: "crypto" },
  {
    id: 5,
    joke: "There are only 10 types of people in the world: those who understand binary and those who don't.",
    category: "programming",
  },
  { id: 6, joke: "Why is Bitcoin bad at poker? It always shows its hash.", category: "crypto" },
];

const handler = async (_: NextRequest) => {
  const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];

  return NextResponse.json({
    success: true,
    data: randomJoke,
    timestamp: new Date().toISOString(),
  });
};

export const GET = withX402(handler, RESOURCE_PAYTO_ADDRESS, {
  price: "$0.001",
  network: "base-sepolia",
  config: {
    description: "Get a random developer/crypto joke",
  },
});
