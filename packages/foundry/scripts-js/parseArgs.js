import { spawnSync } from "child_process";
import { config } from "dotenv";
config();

// Get all arguments after the script name
const args = process.argv.slice(2);
let fileName = "Deploy.s.sol";
let network = "localhost";

// Show help message if --help is provided
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: yarn deploy [options]

Options:
  --file <filename>     Specify the deployment script file (default: Deploy.s.sol)
  --network <network>   Specify the network (default: localhost)
  --help, -h           Show this help message

Examples:
  yarn deploy --file DeployYourContract.s.sol --network sepolia
  yarn deploy --network sepolia
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
  }
}

if (
  process.env.ETH_KEYSTORE_ACCOUNT === "scaffold-eth-default" &&
  network !== "localhost"
) {
  console.log(
    "\nError: Cannot deploy to live network using 'scaffold-eth-default' keystore account!",
    "\nPlease update your .env file to use a custom keysotre account by setting ETH_KEYSTORE_ACCOUNT='scaffold-eth-custom'"
  );
  process.exit(0);
}

if (
  process.env.ETH_KEYSTORE_ACCOUNT !== "scaffold-eth-default" &&
  network === "localhost"
) {
  console.log(
    `\nWarning: Using ${process.env.ETH_KEYSTORE_ACCOUNT} keystore account on localhost.`,
    `\nPlease enter the password for ${process.env.ETH_KEYSTORE_ACCOUNT} account\n`
  );
}

// Set environment variables for the make command
process.env.DEPLOY_SCRIPT = `script/${fileName}`;
process.env.RPC_URL = network;

const result = spawnSync(
  "make",
  [
    "build-and-deploy",
    `DEPLOY_SCRIPT=${process.env.DEPLOY_SCRIPT}`,
    `RPC_URL=${process.env.RPC_URL}`,
  ],
  {
    stdio: "inherit",
    shell: true,
  }
);

process.exit(result.status);
