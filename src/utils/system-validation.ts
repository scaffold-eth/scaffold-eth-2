import chalk from "chalk";
import { execa } from "execa";

export const validateFoundryUp = async () => {
  try {
    await execa("foundryup", ["-h"]);
  } catch (error) {
    const message = ` ${chalk.bold.yellow("Attention: Foundryup is not installed in your system.")}
 ${chalk.bold.yellow("To use foundry, please install foundryup")}
 ${chalk.bold.yellow("Checkout: https://getfoundry.sh")}
    `;
    throw new Error(message);
  }
};
