import { spawn } from "child_process";
import readline from "readline";
import { config } from "dotenv";

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompts the user for input with the given question
 * @param {string} question - The question to ask the user
 * @returns {Promise<string>} - The user's response
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
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
      console.error("\n❌ Cannot use 'scaffold-eth-default' as account name. This is reserved for local development.");
      process.exit(1);
    }

    // Get private key from command line args or prompt user
    let privateKey = process.argv[3];
    if (!privateKey) {
      privateKey = await prompt("\nEnter private key: ");
      console.log("\n");
      
      if (!privateKey.trim()) {
        console.error("\n❌ Private key cannot be empty");
        process.exit(1);
      }
    }

    // Add 0x prefix if not present
    if (!privateKey.startsWith("0x")) {
      privateKey = `0x${privateKey}`;
    }
    
    // Close the readline interface before spawning the process
    // This allows the terminal to be fully available for the cast command's password prompt
    rl.close();

    const importProcess = spawn(
      "make",
      [
        "account-import",
        `ACCOUNT_NAME=${accountName}`,
        `PRIVATE_KEY=${privateKey}`
      ],
      {
        stdio: "inherit",
        shell: true,
        cwd: process.cwd()
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
importAccount().catch(error => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
