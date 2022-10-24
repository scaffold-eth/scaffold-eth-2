import { ethers, Wallet } from "ethers";
import QRCode from "qrcode";
import { config } from "hardhat";

async function main() {
  // Read mnemonic / private key from .env => if not => return
  const privateKey =
    "0x4cdb52ad027bffde212d5a8eeeeb308ee70c4add12f7a4fbba38cf5bb6eb474e";

  // Get account from private key.
  const wallet = new Wallet(privateKey);
  const address = wallet.address;
  console.log(
    await QRCode.toString(address, { type: "terminal", small: true })
  );
  console.log("Public address:", address, "\n");

  // Balance on each network
  const availableNetworks = config.networks;
  for (const networkName in availableNetworks) {
    try {
      const network = availableNetworks[networkName];
      if (!network?.url) continue;

      const provider = new ethers.providers.JsonRpcProvider(network.url);
      const balance = await provider.getBalance(address);
      console.log("--", networkName, "-- 📡");
      console.log("   balance:", +ethers.utils.formatEther(balance));
      console.log("   nonce:", +(await provider.getTransactionCount(address)));
    } catch (e) {
      console.log("Can't connect to network", networkName);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
