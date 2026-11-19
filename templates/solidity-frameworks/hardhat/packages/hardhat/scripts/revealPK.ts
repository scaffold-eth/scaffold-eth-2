import * as dotenv from "dotenv";
dotenv.config();
import { Wallet } from "ethers";
import password from "@inquirer/password";

async function main() {
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;

  if (!encryptedKey) {
    console.log("🚫️ You don't have a deployer account. Run `yarn generate` or `yarn account:import` first");
    return;
  }

  console.log("👀 This will reveal your private key on the console.\n");

  const pass = await password({ message: "Enter your password to decrypt the private key:" });
  let wallet: Wallet;
  try {
    wallet = (await Wallet.fromEncryptedJson(encryptedKey, pass)) as Wallet;
  } catch {
    console.log("❌ Failed to decrypt private key. Wrong password?");
    return;
  }

  console.log("\n🔑 Private key:", wallet.privateKey);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
