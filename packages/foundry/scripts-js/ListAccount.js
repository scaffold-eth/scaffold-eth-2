import { config } from "dotenv";
config();
import { join, dirname } from "path";
import { ethers, Wallet } from "ethers";
import { toString } from "qrcode";
import { readFileSync } from "fs";
import { parse } from "toml";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ALCHEMY_API_KEY =
  process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

async function getBalanceForEachNetwork(address) {
  try {
    // Read the foundry.toml file
    const foundryTomlPath = join(__dirname, "..", "foundry.toml");
    const tomlString = readFileSync(foundryTomlPath, "utf-8");

    // Parse the tomlString to get the JS object representation
    const parsedToml = parse(tomlString);

    // Extract rpc_endpoints from parsedToml
    const rpcEndpoints = parsedToml.rpc_endpoints;

    // Replace placeholders in the rpc_endpoints section
    function replaceENVAlchemyKey(input) {
      return input.replace("${ALCHEMY_API_KEY}", ALCHEMY_API_KEY);
    }

    for (const networkName in rpcEndpoints) {
      if (networkName === "localhost") continue;

      const networkUrl = replaceENVAlchemyKey(rpcEndpoints[networkName]);

      try {
        const provider = new ethers.providers.JsonRpcProvider(networkUrl);
        const balance = await provider.getBalance(address);
        console.log("--", networkName, "-- 📡");
        console.log("   balance:", +ethers.utils.formatEther(balance));
        console.log(
          "   nonce:",
          +(await provider.getTransactionCount(address))
        );
      } catch (e) {
        console.log("Can't connect to network", networkName);
        console.log();
      }
    }
  } catch (error) {
    console.error("Error reading foundry.toml:", error);
  }
}

function verifyAddressFormat(address) {
  try {
    ethers.utils.getAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const address = process.argv[2];

  if (process.env.ETH_KEYSTORE_ACCOUNT === "scaffold-eth-default") {
    console.log("Displaying balance for deault account");
    console.log(
      "Did you forgot to update ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom in .env file?\n"
    );
  }

  if (!verifyAddressFormat(address)) {
    console.log(
      `🚫️ Unable to access keystore account ${process.env.ETH_KEYSTORE_ACCOUNT}`
    );
    console.log(
      "\nPlease run `yarn account:generate` to generate deployer keystore account and update `ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom` in `.env` file"
    );
    return;
  }

  console.log(await toString(address, { type: "terminal", small: true }));
  console.log("Public address:", address, "\n");

  await getBalanceForEachNetwork(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
