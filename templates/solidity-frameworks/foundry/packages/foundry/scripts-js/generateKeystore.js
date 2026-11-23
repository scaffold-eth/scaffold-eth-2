import { spawnSync, spawn } from "child_process";
import readline from "readline";
import { fileURLToPath } from "url";

async function createKeystore() {
  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Generate a new wallet
    console.log("\n🔑 Generating new wallet...");
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

    // Close readline before spawning process with inherited stdio
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
  } catch (error) {
    console.error("\n❌ Error creating keystore:", error);
    process.exit(1);
  } finally {
    // Ensure readline is closed
    if (rl) rl.close();
  }
}

// Run the function if this script is called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createKeystore()
    .then((keystoreName) => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createKeystore };