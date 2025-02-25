import { spawnSync } from "child_process";
import { config } from "dotenv";
import { join, dirname } from "path";
import { readFileSync } from "fs";
import { parse } from "toml";
import { fileURLToPath } from "url";
import { accessSync } from "fs";
import { constants } from "fs";
import { selectKeystore } from './selectKeystore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config();

// Get all arguments after the script name
const args = process.argv.slice(2);
let fileName = "Deploy.s.sol";
let network = "localhost";
let specifiedKeystore = null;

// Show help message if --help is provided
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: yarn deploy [options]
Options:
  --file <filename>     Specify the deployment script file (default: Deploy.s.sol)
  --network <network>   Specify the network (default: localhost)
  --keystore <name>     Specify the keystore to use (skips interactive selection)
  --help, -h           Show this help message
Examples:
  yarn deploy --file DeployYourContract.s.sol --network sepolia
  yarn deploy --network sepolia --keystore scaffold-eth-custom
  yarn deploy --file DeployYourContract.s.sol
  yarn deploy
  `);
  process.exit(0);
}

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--network" && args[i + 1]) {
    network = args[i + 1];
    i++; // Skip next arg since we used it
  } else if (args[i] === "--file" && args[i + 1]) {
    fileName = args[i + 1];
    i++; // Skip next arg since we used it
  } else if (args[i] === "--keystore" && args[i + 1]) {
    specifiedKeystore = args[i + 1];
    i++; // Skip next arg since we used it
  }
}

// Check if the network exists in rpc_endpoints
try {
  const foundryTomlPath = join(__dirname, "..", "foundry.toml");
  const tomlString = readFileSync(foundryTomlPath, "utf-8");
  const parsedToml = parse(tomlString);

  if (!parsedToml.rpc_endpoints[network]) {
    console.log(
      `\n❌ Error: Network '${network}' not found in foundry.toml!`,
      "\nPlease check `foundry.toml` for available networks in the [rpc_endpoints] section or add a new network."
    );
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ Error reading or parsing foundry.toml:", error);
  process.exit(1);
}

let selectedKeystore = process.env.ETH_KEYSTORE_ACCOUNT;
if (network !== "localhost") {
  if (specifiedKeystore) {
    // If keystore is specified, verify it exists
    const keystorePath = join(process.env.HOME, '.foundry', 'keystores', specifiedKeystore);
    try {
      accessSync(keystorePath, constants.F_OK);
    } catch (error) {
      console.error(`\n❌ Error: Keystore '${specifiedKeystore}' not found!`);
      process.exit(1);
    }

    selectedKeystore = specifiedKeystore;
  } else {
    // Interactive keystore selection if not specified
    try {
      selectedKeystore = await selectKeystore();
    } catch (error) {
      console.error("\n❌ Error selecting keystore:", error);
      process.exit(1);
    }
  }
  process.env.ETH_KEYSTORE_ACCOUNT = selectedKeystore;
}

// Set environment variables for the make command
process.env.DEPLOY_SCRIPT = `script/${fileName}`;
process.env.RPC_URL = network;

const result = spawnSync(
  "make",
  [
    "deploy-and-generate-abis",
    `DEPLOY_SCRIPT=${process.env.DEPLOY_SCRIPT}`,
    `RPC_URL=${process.env.RPC_URL}`,
    `ETH_KEYSTORE_ACCOUNT=${process.env.ETH_KEYSTORE_ACCOUNT}`,
  ],
  {
    stdio: "inherit",
    shell: true,
  }
);

process.exit(result.status);
