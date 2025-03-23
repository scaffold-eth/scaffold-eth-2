import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { spawnSync, spawn } from "child_process";
import readline from "readline";
import { fileURLToPath } from "url";

async function selectOrCreateKeystore() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const keystorePath = join(process.env.HOME, ".foundry", "keystores");
  let keystores = [];

  try {
    if (existsSync(keystorePath)) {
      keystores = readdirSync(keystorePath).filter(
        (keystore) => keystore !== "scaffold-eth-default"
      );
    }

    if (keystores.length === 0) {
      console.log("\n📁 No keystores found. Creating a new wallet...");
      return await createWallet(rl);
    }

    console.log("\n🔑 Available keystores:");
    console.log("0. Create new keystore");

    keystores.forEach((keystore, index) => {
      console.log(`${index + 1}. ${keystore}`);
    });

    const answer = await new Promise((resolve) => {
      rl.question(
        "\nSelect a keystore or create new (enter number): ",
        resolve
      );
    });

    const selection = parseInt(answer);

    if (selection === 0) {
      return await createWallet(rl);
    }

    if (isNaN(selection) || selection < 1 || selection > keystores.length) {
      console.error("\n❌ Invalid selection");
      process.exit(1);
    }

    const selectedKeystore = keystores[selection - 1];
    rl.close();
    return selectedKeystore;
  } catch (error) {
    console.error("\n❌ Error reading keystores:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function createWallet(rl) {
  const newWalletResult = spawnSync("cast", ["wallet", "new"], {
    encoding: "utf-8",
  });

  if (newWalletResult.error || newWalletResult.status !== 0) {
    console.error(
      "\n❌ Error generating new wallet:",
      newWalletResult.stderr || newWalletResult.error
    );
    process.exit(1);
  }

  const privateKey = newWalletResult.stdout
    .split("\n")
    .find((line) => line.includes("Private key:"))
    ?.split(":")[1]
    ?.trim();

  if (!privateKey) {
    console.error("\n❌ Could not extract private key from output");
    process.exit(1);
  }

  const keystoreName = await new Promise((resolve) => {
    rl.question("\nEnter name for new keystore: ", resolve);
  });

  rl.close();

  return new Promise((resolve, reject) => {
    const importProcess = spawn(
      "cast",
      ["wallet", "import", keystoreName, "--private-key", privateKey],
      {
        stdio: "inherit",
      }
    );

    importProcess.on("close", (code) => {
      if (code === 0) {
        console.log(
          "\n💰 Fund the address and re-run the deploy command to use this keystore."
        );
        console.log(
          `\nTIP: Use \`yarn account\` and select \`${keystoreName}\` keystore to check if the address is funded.`
        );
        process.exit(0);
      } else {
        console.error("\n❌ Error importing keystore");
        reject(new Error("Import failed"));
      }
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  selectOrCreateKeystore()
    .then((keystore) => {
      console.log("\n🔑 Selected keystore:", keystore);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { selectOrCreateKeystore };
