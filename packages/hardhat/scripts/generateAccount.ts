import { ethers } from "ethers";
import { parse, stringify } from "envfile";
import * as fs from "fs";

const envFilePath = "./.env";

const setNewEnvConfig = (existingEnvConfig = {}) => {
  console.log("👛 Generating new Wallet");
  const randomWallet = ethers.Wallet.createRandom();

  const newEnvConfig = {
    ...existingEnvConfig,
    DEPLOYER_PRIVATE_KEY: randomWallet.privateKey,
  };

  // Store in .env
  fs.writeFileSync(envFilePath, stringify(newEnvConfig));
  console.log("📄 Mnemonic/Private key saved to packages/hardhat/.env file");
};

async function main() {
  // Check if wallet exists (defined on .env) => return.

  if (!fs.existsSync(envFilePath)) {
    setNewEnvConfig();
    return;
  }

  // file exists
  const existingEnvConfig = parse(fs.readFileSync(envFilePath).toString());
  if (existingEnvConfig.DEPLOYER_PRIVATE_KEY) {
    console.log(
      "⚠️ You already have a deployer account. Check the packages/hardhat/.env file"
    );
    return;
  }

  setNewEnvConfig(existingEnvConfig);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
