import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";

// Create HTTP facilitator client - the facilitator verifies and settles payments
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

// Create x402 resource server and register the EVM payment scheme
export const server = new x402ResourceServer(facilitatorClient);
server.register("eip155:*", new ExactEvmScheme());
