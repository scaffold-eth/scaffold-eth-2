import { Wallet } from "ethers";
import { parse, stringify } from "envfile";
import { writeFileSync, existsSync, readFileSync } from "fs";

const envFilePath = "./.env";

/**
 * Generate a new random private key and write it to the .env file
 * @param existingEnvConfig
 */
const setNewEnvConfig = (existingEnvConfig = {}) => {
  console.log("👛 Generating new Wallet");
  const randomWallet = Wallet.createRandom();

  const newEnvConfig = {
    ...existingEnvConfig,
    DEPLOYER_PRIVATE_KEY: randomWallet.privateKey,
  };

  // Store in .env
  writeFileSync(envFilePath, stringify(newEnvConfig));
  console.log("📄 Private Key saved to packages/foundry/.env file");
  console.log("🪄 Generated wallet address:", randomWallet.address);
};

async function main() {
  if (!existsSync(envFilePath)) {
    console.log("entered here");
    // No .env file yet.
    setNewEnvConfig();
    return;
  }

  // .env file exists
  const existingEnvConfig = parse(readFileSync(envFilePath).toString());
  if (existingEnvConfig.DEPLOYER_PRIVATE_KEY) {
    console.log(
      "⚠️ You already have a deployer account. Check the packages/foundry/.env file"
    );
    return;
  }

  setNewEnvConfig(existingEnvConfig);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
