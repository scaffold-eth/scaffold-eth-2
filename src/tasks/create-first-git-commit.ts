import { execa } from "execa";
import { Options } from "../types";
import path from "path";

// Checkout the latest release tag in a git submodule
async function checkoutLatestTag(submodulePath: string): Promise<void> {
  try {
    const { stdout } = await execa("git", ["tag", "-l", "--sort=-v:refname"], {
      cwd: submodulePath,
    });
    const tagLines = stdout.split("\n");
    if (tagLines.length > 0) {
      const latestTag = tagLines[0];
      await execa("git", ["-C", `${submodulePath}`, "checkout", latestTag]);
    } else {
      throw new Error(`No tags found in submodule at ${submodulePath}`);
    }
  } catch (error) {
    console.error("Error checking out latest tag:", error);
    throw error;
  }
}

export async function createFirstGitCommit(
  targetDir: string,
  options: Options
) {
  try {
    // TODO: Move the logic for adding submodules to tempaltes
    if (options.extensions?.includes("foundry")) {
      const foundryWorkSpacePath = path.resolve(
        targetDir,
        "packages",
        "foundry"
      );
      await execa(
        "git",
        [
          "submodule",
          "add",
          "https://github.com/foundry-rs/forge-std",
          "lib/forge-std",
        ],
        {
          cwd: foundryWorkSpacePath,
        }
      );
      await execa(
        "git",
        [
          "submodule",
          "add",
          "https://github.com/OpenZeppelin/openzeppelin-contracts",
          "lib/openzeppelin-contracts",
        ],
        {
          cwd: foundryWorkSpacePath,
        }
      );
      await execa(
        "git",
        [
          "submodule",
          "add",
          "https://github.com/gnsps/solidity-bytes-utils",
          "lib/solidity-bytes-utils",
        ],
        {
          cwd: foundryWorkSpacePath,
        }
      );
      await execa("git", ["submodule", "update", "--init", "--recursive"], {
        cwd: foundryWorkSpacePath,
      });
      await checkoutLatestTag(
        path.resolve(foundryWorkSpacePath, "lib", "forge-std")
      );
      await checkoutLatestTag(
        path.resolve(foundryWorkSpacePath, "lib", "openzeppelin-contracts")
      );
    }

    await execa("git", ["add", "-A"], { cwd: targetDir });
    await execa(
      "git",
      ["commit", "-m", "Initial commit with 🏗️ Scaffold-ETH 2", "--no-verify"],
      { cwd: targetDir }
    );

    // Update the submodule, since we have checked out the latest tag in the previous step of foundry
    if (options.extensions?.includes("foundry")) {
      await execa("git", ["submodule", "update", "--init", "--recursive"], {
        cwd: path.resolve(targetDir, "packages", "foundry"),
      });
    }
  } catch (e: any) {
    // cast error as ExecaError to get stderr

    throw new Error("Failed to initialize git repository", {
      cause: e?.stderr ?? e,
    });
  }
}
