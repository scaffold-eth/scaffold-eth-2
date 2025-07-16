import { execa } from "execa";
import { Options } from "../types";
import path from "path";
import { SOLIDITY_FRAMEWORKS } from "../utils/consts";
import packageJson from "../../package.json";

const foundryLibraries = ["foundry-rs/forge-std", "OpenZeppelin/openzeppelin-contracts", "gnsps/solidity-bytes-utils"];
const createEthVersion = packageJson.version;

export async function createFirstGitCommit(targetDir: string, options: Options) {
  try {
    await execa("git", ["add", "-A"], { cwd: targetDir });
    await execa("git", ["commit", "-m", `Initial commit with 🏗️ Scaffold-ETH 2 @ ${createEthVersion}`, "--no-verify"], {
      cwd: targetDir,
    });

    if (options.solidityFramework === SOLIDITY_FRAMEWORKS.FOUNDRY) {
      const foundryWorkSpacePath = path.resolve(targetDir, "packages", SOLIDITY_FRAMEWORKS.FOUNDRY);
      // forge install foundry libraries
      await execa("forge", ["install", ...foundryLibraries], { cwd: foundryWorkSpacePath });
      await execa("git", ["add", "-A"], { cwd: targetDir });
      await execa("git", ["commit", "--amend", "--no-edit"], { cwd: targetDir });
    }
  } catch (e: any) {
    // cast error as ExecaError to get stderr
    throw new Error("Failed to initialize git repository", {
      cause: e?.stderr ?? e,
    });
  }
}
