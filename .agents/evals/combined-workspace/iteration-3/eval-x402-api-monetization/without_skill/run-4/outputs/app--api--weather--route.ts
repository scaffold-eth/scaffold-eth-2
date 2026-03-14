import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import type { Address } from "viem";

// The address that will receive USDC payments
const RESOURCE_PAYTO_ADDRESS = (process.env.X402_PAYTO_ADDRESS || "0xYourAddressHere") as Address;

// Simulated weather data for demonstration
const WEATHER_DATA = [
  { city: "New York", temp: 72, condition: "Sunny", humidity: 45, wind: "8 mph NW" },
  { city: "London", temp: 58, condition: "Cloudy", humidity: 78, wind: "12 mph SW" },
  { city: "Tokyo", temp: 68, condition: "Partly Cloudy", humidity: 55, wind: "5 mph E" },
  { city: "Paris", temp: 63, condition: "Rainy", humidity: 82, wind: "15 mph W" },
  { city: "Sydney", temp: 77, condition: "Clear", humidity: 40, wind: "10 mph SE" },
];

const handler = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (city) {
    const weather = WEATHER_DATA.find(w => w.city.toLowerCase() === city.toLowerCase());
    if (weather) {
      return NextResponse.json({
        success: true,
        data: weather,
        timestamp: new Date().toISOString(),
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: `Weather data not found for city: ${city}`,
        availableCities: WEATHER_DATA.map(w => w.city),
      },
      { status: 404 },
    );
  }

  // Return all cities if no specific city requested
  return NextResponse.json({
    success: true,
    data: WEATHER_DATA,
    timestamp: new Date().toISOString(),
  });
};

export const GET = withX402(handler, RESOURCE_PAYTO_ADDRESS, {
  price: "$0.001",
  network: "base-sepolia",
  config: {
    description: "Access premium weather data API",
  },
});
