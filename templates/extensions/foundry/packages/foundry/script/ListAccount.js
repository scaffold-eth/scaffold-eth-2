const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const { ethers, Wallet } = require("ethers");
const QRCode = require("qrcode");
const fs = require("fs");
const toml = require("toml");

const ALCHEMY_API_KEY =
  process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

async function getBalanceForEachNetwork(address) {
  try {
    // Read the foundry.toml file
    const foundryTomlPath = path.join(__dirname, "..", "foundry.toml");
    const tomlString = fs.readFileSync(foundryTomlPath, "utf-8");

    // Parse the tomlString to get the JS object representation
    const parsedToml = toml.parse(tomlString);

    // Extract rpc_endpoints from parsedToml
    const rpcEndpoints = parsedToml.rpc_endpoints;

    // Replace placeholders in the rpc_endpoints section
    function replaceENVAlchemyKey(input) {
      return input.replace("${ALCHEMY_API_KEY}", ALCHEMY_API_KEY);
    }

    for (const networkName in rpcEndpoints) {
      if (networkName === "localhost" || networkName === "default_network")
        continue;

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
async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.log(
      "🚫️ You don't have a deployer account. Run `yarn generate` first"
    );
    return;
  }

  // Get account from private key.
  const wallet = new Wallet(privateKey);
  const address = wallet.address;
  console.log(
    await QRCode.toString(address, { type: "terminal", small: true })
  );
  console.log("Public address:", address, "\n");

  await getBalanceForEachNetwork(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
