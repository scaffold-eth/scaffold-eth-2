import { readdirSync } from "fs";
import { join } from "path";
import readline from "readline";
import { fileURLToPath } from "url";

async function listKeystores(
  selectMessage = "Select a keystore (enter the number, e.g., 1):"
) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const keystorePath = join(process.env.HOME, ".foundry", "keystores");

  try {
    const keystores = readdirSync(keystorePath).filter(
      (keystore) => keystore !== "scaffold-eth-default"
    );

    if (keystores.length === 0) {
      console.error(
        "\n❌ No keystores found in ~/.foundry/keystores, please create a new keystore by running:"
      );
      console.log("\n\tyarn account:generate\n");
      process.exit(1);
    }

    console.log("\n💼 Available keystores:");

    keystores.map((keystore, index) => {
      console.log(`${index + 1}. ${keystore}`);

      return { keystore };
    });

    const answer = await new Promise((resolve) => {
      rl.question(`\n${selectMessage}`, resolve);
    });

    const selection = parseInt(answer);

    if (isNaN(selection) || selection < 1 || selection > keystores.length) {
      console.error("\n❌ Invalid selection");
      process.exit(1);
    }

    const selectedKeystore = keystores[selection - 1];

    return selectedKeystore;
  } catch (error) {
    console.error("\n❌ Error reading keystores:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the selection if this script is called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  listKeystores()
    .then((keystore) => {
      console.log("\n🔑 Selected keystore:", keystore);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { listKeystores };
