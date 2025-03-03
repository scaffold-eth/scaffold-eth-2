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
 * Prompts for password with hidden input
 * @param {string} question - The prompt text
 * @returns {Promise<string>} - The user's response (hidden during input)
 */
function promptHidden(question) {
  return new Promise((resolve) => {
    // Display the question first
    output.write(question);

    // Configure stdin
    input.setRawMode(true);
    input.resume();
    input.setEncoding("utf8");

    let password = "";

    // Handle keypress events
    const onData = (key) => {
      // Ctrl+C
      if (key === "\u0003") {
        output.write("\n");
        process.exit(1);
      }
      // Enter key
      else if (key === "\r" || key === "\n") {
        output.write("\n");
        input.setRawMode(false);
        input.pause();
        input.removeListener("data", onData);
        resolve(password);
      }
      // Backspace
      else if (key === "\u0008" || key === "\u007F") {
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
      }
      // Regular character
      else {
        password += key;
      }
    };

    input.on("data", onData);
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

    // Get private key from command line args or prompt user
    let privateKey = process.argv[3];
    if (!privateKey) {
      // Use the hidden input method for the private key
      privateKey = await promptHidden("\nPaste your private key: ");

      if (!privateKey.trim()) {
        console.error("\n❌ Private key cannot be empty");
        process.exit(1);
      }
    }

    // Add 0x prefix if not present
    if (!privateKey.startsWith("0x")) {
      privateKey = `0x${privateKey}`;
    }

    const importProcess = spawn(
      "make",
      [
        "account-import",
        `ACCOUNT_NAME=${accountName}`,
        `PRIVATE_KEY=${privateKey}`,
      ],
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
