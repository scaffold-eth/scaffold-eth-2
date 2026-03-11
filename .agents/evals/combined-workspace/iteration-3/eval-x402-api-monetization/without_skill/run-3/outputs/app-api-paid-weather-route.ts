import { NextResponse } from "next/server";
import { withX402Payment } from "~~/utils/x402";

/**
 * Mock weather data that is gated behind a micropayment.
 * In a real application, this could be premium data from an external API,
 * AI-generated content, or any valuable data worth monetizing.
 */
const WEATHER_DATA = [
  {
    city: "New York",
    temperature: 72,
    unit: "F",
    condition: "Partly Cloudy",
    humidity: 58,
    windSpeed: 12,
    windDirection: "NW",
    forecast: "Clear skies expected through the weekend",
    uvIndex: 6,
    visibility: 10,
  },
  {
    city: "San Francisco",
    temperature: 62,
    unit: "F",
    condition: "Foggy",
    humidity: 78,
    windSpeed: 8,
    windDirection: "W",
    forecast: "Morning fog clearing to sunshine by noon",
    uvIndex: 4,
    visibility: 3,
  },
  {
    city: "Miami",
    temperature: 88,
    unit: "F",
    condition: "Sunny",
    humidity: 72,
    windSpeed: 6,
    windDirection: "SE",
    forecast: "Afternoon thunderstorms possible",
    uvIndex: 9,
    visibility: 10,
  },
  {
    city: "Chicago",
    temperature: 55,
    unit: "F",
    condition: "Windy",
    humidity: 45,
    windSpeed: 22,
    windDirection: "N",
    forecast: "Gusty winds continuing through tomorrow",
    uvIndex: 3,
    visibility: 8,
  },
  {
    city: "Denver",
    temperature: 48,
    unit: "F",
    condition: "Snow",
    humidity: 65,
    windSpeed: 15,
    windDirection: "NE",
    forecast: "2-4 inches of snow expected overnight",
    uvIndex: 2,
    visibility: 2,
  },
];

/**
 * The actual handler that returns weather data.
 * This is wrapped with withX402Payment to require micropayment before access.
 */
async function weatherHandler(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");

  if (city) {
    const weather = WEATHER_DATA.find(w => w.city.toLowerCase() === city.toLowerCase());
    if (weather) {
      return NextResponse.json({
        success: true,
        data: weather,
        timestamp: new Date().toISOString(),
        paidAccess: true,
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: `City "${city}" not found. Available cities: ${WEATHER_DATA.map(w => w.city).join(", ")}`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: WEATHER_DATA,
    timestamp: new Date().toISOString(),
    paidAccess: true,
    availableCities: WEATHER_DATA.map(w => w.city),
  });
}

/**
 * GET /api/paid-weather
 *
 * Payment-gated weather API endpoint.
 * - Without payment: returns HTTP 402 with payment requirements
 * - With valid X-PAYMENT header: returns weather data
 *
 * Query params:
 *   ?city=<name> - Get weather for a specific city
 *   (no params)  - Get weather for all cities
 */
export const GET = withX402Payment(weatherHandler, {
  description: "Premium weather data API - costs $0.01 USDC per request",
});
