import { privateKeyToAccount } from "viem/accounts";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";

const API_URL = "http://localhost:3000/api/payment/builder";

async function main() {
  // Use SE-2's deployer account (yarn generate / yarn account:import)
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.log("No deployer key found. Run `yarn generate` first.");
    return;
  }

  const signer = privateKeyToAccount(privateKey);

  // Create x402 client and register EVM payment scheme
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  console.log("Sending x402 request from", signer.address);

  const response = await fetchWithPayment(API_URL, { method: "GET" });
  const body = await response.json();
  console.log("Response:", JSON.stringify(body, null, 2));

  // Check settlement receipt
  const paymentResponse = response.headers.get("PAYMENT-RESPONSE");
  if (paymentResponse) {
    console.log("Payment settled:", paymentResponse);
  }
}

main().catch(console.error);
