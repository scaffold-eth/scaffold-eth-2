import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js middleware that adds CORS headers for x402 payment-gated API routes.
 *
 * This middleware ensures that:
 * - The X-PAYMENT header can be sent by client-side JavaScript
 * - Preflight OPTIONS requests are handled correctly
 * - The X-PAYMENT-REQUIRED header is exposed to the client
 */
export function middleware(request: NextRequest) {
  // Handle preflight requests for payment-gated routes
  if (request.method === "OPTIONS" && request.nextUrl.pathname.startsWith("/api/paid-")) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-PAYMENT",
        "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // For actual requests, add CORS headers to the response
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/paid-")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT");
    response.headers.set("Access-Control-Expose-Headers", "X-PAYMENT-REQUIRED");
  }

  return response;
}

export const config = {
  matcher: "/api/paid-:path*",
};
