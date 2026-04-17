import "dotenv/config";
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { spawn } from "child_process";

/**
 * Unencrypts the private key and runs the hardhat deploy command,
 * then generates TypeScript ABIs for the frontend.
 */
async function main() {
  const networkIndex = process.argv.indexOf("--network");
  const networkName = networkIndex !== -1 ? process.argv[networkIndex + 1] : "default";

  const isLocalNetwork = networkName === "default" || networkName === "hardhat";

  if (!isLocalNetwork) {
    const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;

    if (!encryptedKey) {
      console.log("🚫️ You don't have a deployer account. Run `yarn generate` or `yarn account:import` first");
      return;
    }

    const pass = await password({ message: "Enter password to decrypt private key:" });

    try {
      const wallet = await Wallet.fromEncryptedJson(encryptedKey, pass);
      process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY = wallet.privateKey;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.error("Failed to decrypt private key. Wrong password?");
      process.exit(1);
    }
  }

  // Run hardhat deploy (skip gas price prompts on local networks)
  const deployArgs = ["deploy", ...process.argv.slice(2)];
  if (isLocalNetwork) {
    deployArgs.push("--skip-prompts");
  }

  const hardhat = spawn("hardhat", deployArgs, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  hardhat.on("exit", code => {
    process.exit(code || 0);
  });
}

main().catch(console.error);
