import "dotenv/config";
import { spawn } from "child_process";

const DEFAULT_ETHERSCAN_KEY = "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

/**
 * Forwards `yarn verify --network <name> [args]` to the rocketh-verify CLI.
 *
 * Translates hardhat's --network flag to rocketh's -e (environment) flag so the
 * DX matches `yarn deploy --network X`. Defaults the subcommand to `etherscan`
 * when none is passed. Falls back to a shared ETHERSCAN_API_KEY so beginners
 * can verify out of the box — set your own in .env for production.
 */
async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(
      [
        "Usage: yarn verify --network <name> [subcommand] [options]",
        "",
        "Subcommands: etherscan (default) | sourcify | blockscout | metadata",
        "",
        "Examples:",
        "  yarn verify --network optimismSepolia",
        "  yarn verify --network sepolia sourcify",
      ].join("\n"),
    );
    return;
  }

  const networkIdx = argv.indexOf("--network");
  const network = networkIdx !== -1 ? argv[networkIdx + 1] : "default";
  const forwarded = argv.filter((_, i) => i !== networkIdx && i !== networkIdx + 1);

  const subcommands = ["etherscan", "sourcify", "blockscout", "metadata"];
  const hasSubcommand = forwarded.some(a => subcommands.includes(a));

  const verifyArgs = ["-e", network, ...(hasSubcommand ? [] : ["etherscan"]), ...forwarded];

  const env = { ...process.env };
  const userKey = process.env.ETHERSCAN_API_KEY;
  env.ETHERSCAN_API_KEY = userKey || DEFAULT_ETHERSCAN_KEY;
  if (!userKey || userKey === DEFAULT_ETHERSCAN_KEY) {
    console.log(
      "ℹ️  Using shared Etherscan API key (rate-limited). Set your own ETHERSCAN_API_KEY in .env for production.\n",
    );
  }

  const child = spawn("rocketh-verify", verifyArgs, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

  child.on("exit", code => {
    process.exit(code || 0);
  });
}

main().catch(console.error);
