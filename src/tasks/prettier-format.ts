import { execa } from "execa";
import path from "path";
import { Options } from "../types";
import { SOLIDITY_FRAMEWORKS } from "../utils/consts";

async function runPrettier(targetPath: string[], prettierConfigPath: string, prettierPlugins: string[]) {
  const result = await execa("yarn", [
    "prettier",
    "--write",
    ...targetPath,
    "--config",
    prettierConfigPath,
    ...prettierPlugins,
    "--no-editorconfig",
  ]);
  if (result.failed) {
    throw new Error(`There was a problem running prettier in ${targetPath.join(" ")}`);
  }
}

export async function prettierFormat(targetDir: string, options: Options) {
  try {
    const nextJsPath = path.join(targetDir, "packages", "nextjs");
    const nextPrettierConfig = path.join(nextJsPath, ".prettierrc.json");

    await runPrettier([nextJsPath], nextPrettierConfig, ["--plugin=@trivago/prettier-plugin-sort-imports"]);

    if (options.solidityFramework === SOLIDITY_FRAMEWORKS.HARDHAT) {
      const hardhatPackagePath = path.join(targetDir, "packages", SOLIDITY_FRAMEWORKS.HARDHAT);
      const hardhatPrettierConfig = path.join(hardhatPackagePath, ".prettierrc.json");
      const hardhatPaths = [
        `${hardhatPackagePath}/*.ts`,
        `${hardhatPackagePath}/deploy/**/*.ts`,
        `${hardhatPackagePath}/scripts/**/*.ts`,
        `${hardhatPackagePath}/test/**/*.ts`,
        `${hardhatPackagePath}/contracts/**/*.sol`,
      ];

      await runPrettier(hardhatPaths, hardhatPrettierConfig, ["--plugin=prettier-plugin-solidity"]);
    }

    if (options.solidityFramework === SOLIDITY_FRAMEWORKS.FOUNDRY) {
      const foundryPackagePath = path.resolve(targetDir, "packages", SOLIDITY_FRAMEWORKS.FOUNDRY);
      const foundryResult = await execa("forge", ["fmt"], { cwd: foundryPackagePath });
      if (foundryResult.failed) {
        throw new Error("There was a problem running forge fmt in the foundry package");
      }
    }
  } catch (error) {
    throw new Error("Failed to run prettier", { cause: error });
  }

  return true;
}
