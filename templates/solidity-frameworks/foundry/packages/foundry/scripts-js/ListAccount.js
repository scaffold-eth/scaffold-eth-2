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

function findAddressFromArgs(args) {
  return args.find((arg) => arg.startsWith("0x") && arg.length === 42);
}

const DEFAULT_KEYSTORE_ACCOUNT = "scaffold-eth-default";
async function main() {
  const address = findAddressFromArgs(process.argv);

  const isValidAddress = verifyAddressFormat(address);
  const isDefaultAccount =
    process.env.ETH_KEYSTORE_ACCOUNT === DEFAULT_KEYSTORE_ACCOUNT;

  if (!isValidAddress) {
    console.log(
      `\n🚫️ Unable to access keystore account ${process.env.ETH_KEYSTORE_ACCOUNT}`
    );

    if (isDefaultAccount) {
      console.log(
        "\n🏠 It seems you are trying to access the localhost account. Did you forget to update ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom in the .env file?\n"
      );
    }

    console.log(
      "\n💡 If you haven't generated a deployer keystore account yet, please run `yarn account:generate`. Then update the `.env` file with `ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom`"
    );
    return;
  }

  if (isValidAddress && isDefaultAccount) {
    console.log("\n⚠️ Displaying balance for default account");
    console.log(
      "\n❓ Did you forget to update ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom in the .env file?\n"
    );
  }

  console.log(await toString(address, { type: "terminal", small: true }));
  console.log("Public address:", address, "\n");

  await getBalanceForEachNetwork(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
