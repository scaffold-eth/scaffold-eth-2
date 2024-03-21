import * as dotenv from "dotenv";
dotenv.config();
import QRCode from "qrcode";
import { config } from "hardhat";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { createPublicClient, formatEther, http } from "viem";
import { HttpNetworkConfig } from "hardhat/types";

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.log("🚫️ You don't have a deployer account. Run `yarn generate` first");
    return;
  }

  // Get account from private key.;
  const randomAccount = privateKeyToAccount(privateKey as `0x${string}`);
  const address = randomAccount.address;
  console.log(await QRCode.toString(address, { type: "terminal", small: true }));
  console.log("Public address:", address, "\n");

  // Balance on each network
  const availableNetworks = config.networks;

  for (const networkName in availableNetworks) {
    try {
      const hardhatConfigNetwork = availableNetworks[networkName];
      if (!("url" in hardhatConfigNetwork)) continue;
      const viemChain = chains[networkName as keyof typeof chains];
      const publicClient = createPublicClient({
        chain: viemChain,
        transport: http((availableNetworks[networkName] as HttpNetworkConfig).url),
      });
      const balance = await publicClient.getBalance({ address });
      console.log("--", networkName, "-- 📡");
      console.log("   balance:", formatEther(balance));
      const nonce = await publicClient.getTransactionCount({ address });
      console.log("   nonce:", nonce);
    } catch (e) {
      console.log("Can't connect to network", networkName);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
