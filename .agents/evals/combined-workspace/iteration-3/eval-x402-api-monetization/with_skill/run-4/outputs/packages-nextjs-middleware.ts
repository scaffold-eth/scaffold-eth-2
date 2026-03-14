import { paymentProxy } from "@x402/next";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL!;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as `0x${string}`;
const network = process.env.NETWORK as `${string}:${string}`;

// Create facilitator client and resource server
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

// Create paywall UI (shown to browsers visiting protected pages)
const paywall = createPaywall()
  .withNetwork(evmPaywall)
  .withConfig({
    appName: "SE-2 Premium API",
    appLogo: "/logo.svg",
    testnet: true,
  })
  .build();

export const middleware = paymentProxy(
  {
    "/api/payment/:path*": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.01",
          network,
          payTo,
        },
      ],
      description: "Access to premium API data",
      mimeType: "application/json",
    },
    "/payment/:path*": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.01",
          network,
          payTo,
        },
      ],
      description: "Access to premium content",
      mimeType: "text/html",
    },
  },
  server,
  undefined,
  paywall,
);

export const config = {
  matcher: ["/api/payment/:path*", "/payment/:path*"],
};
