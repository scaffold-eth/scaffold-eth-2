import { ethers } from "ethers";

async function main() {
  // Check if wallet exists (defined on .env) => return.

  // Generate random wallet
  console.log("👛 Generating new Wallet");
  const randomWallet = ethers.Wallet.createRandom();

  console.log("Private key", randomWallet.privateKey);
  console.log("Mnemonic", randomWallet.mnemonic.phrase);

  // Store in .env
  console.log("📄 Mnemonic/Private key saved to packages/hardhat/.env file");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
