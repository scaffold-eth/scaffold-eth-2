import chalk from "chalk";
import { execa } from "execa";
import semver from "semver";

export const validateFoundryUp = async () => {
  try {
    await execa("foundryup", ["-h"]);
  } catch {
    const message = ` ${chalk.bold.yellow("Attention: Foundryup is not installed in your system.")}
 ${chalk.bold.yellow("To use foundry, please install foundryup")}
 ${chalk.bold.yellow("Checkout: https://getfoundry.sh")}
    `;
    throw new Error(message);
  }
};

export const checkSystemRequirements = async () => {
  const errors: string[] = [];

  try {
    const { stdout: nodeVersion } = await execa("node", ["--version"]);
    const cleanNodeVersion = nodeVersion.replace("v", "");
    if (semver.lt(cleanNodeVersion, "20.18.3")) {
      errors.push(`Node.js version must be >= 20.18.3. Current version: ${nodeVersion}`);
    }
  } catch {
    errors.push("Node.js is not installed. Please install Node.js >= 20.18.3");
  }

  try {
    const { stdout: yarnVersion } = await execa("yarn", ["--version"]);
    if (semver.lt(yarnVersion, "1.0.0")) {
      errors.push(`Yarn version should be >= 1.0.0. Recommended version is >= 2.0.0. Current version: ${yarnVersion}`);
    }
  } catch {
    errors.push("Yarn is not installed. Please install Yarn >= 1.0.0. Recommended version is >= 2.0.0");
  }

  try {
    await execa("git", ["--version"]);

    try {
      await execa("git", ["config", "user.name"]);
    } catch {
      errors.push("Git user.name is not configured. Please set it using: git config --global user.name 'Your Name'");
    }

    try {
      await execa("git", ["config", "user.email"]);
    } catch {
      errors.push(
        "Git user.email is not configured. Please set it using: git config --global user.email 'your.email@example.com'",
      );
    }
  } catch {
    errors.push("Git is not installed. Please install Git");
  }

  return { errors };
};
