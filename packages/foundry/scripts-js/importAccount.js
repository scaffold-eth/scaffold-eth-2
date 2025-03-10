import { spawn } from "child_process";
import { createInterface } from "readline";
import { config } from "dotenv";
import { stdin as input, stdout as output } from "process";
config();

/**
 * Prompts the user for input with the given question
 * @param {string} question - The question to ask the user
 * @returns {Promise<string>} - The user's response
 */
function prompt(question) {
  const rl = createInterface({
    input,
    output,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Main function to import an account
 */
async function importAccount() {
  try {
    // Get account name from command line args or prompt user
    let accountName = process.argv[2];
    if (!accountName) {
      accountName = await prompt("\nEnter account name (e.g., my-keystore): ");

      if (!accountName.trim()) {
        console.error("\n❌ Account name cannot be empty");
        process.exit(1);
      }
    }

    // Check if account name is scaffold-eth-default
    if (accountName === "scaffold-eth-default") {
      console.error(
        "\n❌ Cannot use 'scaffold-eth-default' as account name. This is reserved for local development."
      );
      process.exit(1);
    }

    const importProcess = spawn(
      "cast",
      ["wallet", "import", accountName, "--interactive"],
      {
        stdio: "inherit",
        shell: true,
        cwd: process.cwd(),
      }
    );

    // Handle process completion
    importProcess.on("close", (code) => {
      if (code === 0) {
        process.exit(0);
      } else {
        console.error(`\n❌ Failed to import account. Error code: ${code}`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("\n❌ Error importing account:", error);
    process.exit(1);
  }
}

// Run the import function
importAccount().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
