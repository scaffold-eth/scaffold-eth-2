import "dotenv/config";
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { spawn } from "child_process";

/**
 * Unencrypts the private key and runs the hardhat deploy command,
 * then generates TypeScript ABIs for the frontend.
 */
async function main() {
  if (process.argv.some(arg => arg.startsWith("--network="))) {
    console.error("🚫️ `--network=<name>` is not supported. Use `--network <name>` instead");
    process.exit(1);
  }

  const networkIndex = process.argv.indexOf("--network");
  // Without the flag, Hardhat takes the network from the HARDHAT_NETWORK env variable
  const networkName = networkIndex !== -1 ? process.argv[networkIndex + 1] : (process.env.HARDHAT_NETWORK ?? "default");

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
    } catch {
      console.error("Failed to decrypt private key. Wrong password?");
      process.exit(1);
    }
  }

  // Run hardhat deploy (compilation already handled by the npm script)
  const deployArgs = ["deploy", "--no-compile", "--skip-prompts", ...process.argv.slice(2)];

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
