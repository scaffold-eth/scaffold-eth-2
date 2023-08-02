import { execa } from "execa";
import { Options } from "../types";
import path from "path";

export async function createFirstGitCommit(
  targetDir: string,
  options: Options
) {
  try {
    // TODO: Move the logic for adding submodules to tempaltes
    if (options.extensions?.includes("foundry")) {
      await execa(
        "git",
        [
          "submodule",
          "add",
          "https://github.com/foundry-rs/forge-std",
          "lib/forge-std",
        ],
        {
          cwd: path.resolve(targetDir, "packages", "foundry"),
        }
      );
      await execa("git", ["submodule", "update", "--init", "--recursive"], {
        cwd: path.resolve(targetDir, "packages", "foundry"),
      });
    }

    await execa("git", ["add", "-A"], { cwd: targetDir });
    await execa(
      "git",
      ["commit", "-m", "Initial commit with 🏗️ Scaffold-ETH 2", "--no-verify"],
      { cwd: targetDir }
    );
  } catch (e: any) {
    // cast error as ExecaError to get stderr

    throw new Error("Failed to initialize git repository", {
      cause: e?.stderr ?? e,
    });
  }
}
