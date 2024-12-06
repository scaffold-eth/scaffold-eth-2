import * as dotenv from "dotenv";
dotenv.config();
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { spawn } from "child_process";

/**
 * Unencrypts the private key and runs the hardhat deploy command
 */
async function main() {
  const isNetworkProvided = process.argv.slice(2).includes("--network");

  if (!isNetworkProvided) {
    // Deploy command on the localhost network
    const hardhat = spawn("hardhat", ["deploy", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: process.env,
    });

    hardhat.on("exit", code => {
      process.exit(code || 0);
    });
    return;
  }

  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;

  if (!encryptedKey) {
    console.log("🚫️ You don't have a deployer account. Run `yarn generate` first");
    return;
  }

  const pass = await password({ message: "Enter password to decrypt private key:", mask: true });

  try {
    const wallet = await Wallet.fromEncryptedJson(encryptedKey, pass);
    process.env.DEPLOYER_PRIVATE_KEY = wallet.privateKey;

    const hardhat = spawn("hardhat", ["deploy", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: process.env,
    });

    hardhat.on("exit", code => {
      process.exit(code || 0);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.error("Failed to decrypt private key. Wrong password?");
    process.exit(1);
  }
}

main().catch(console.error);
