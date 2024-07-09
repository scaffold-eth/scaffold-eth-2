import type { Options } from "../types";
import chalk from "chalk";
import { SOLIDITY_FRAMEWORKS } from "./consts";

export function renderOutroMessage(options: Options) {
  let message = `
  \n
  ${chalk.bold.green("Congratulations!")} Your project has been scaffolded! 🎉

  ${chalk.bold("Next steps:")}
  
  ${chalk.dim("cd")} ${options.project}
  `;

  if (!options.install) {
    message += `
    \t${chalk.bold("Install dependencies & format files")}
    \t${chalk.dim("yarn")} install && ${chalk.dim("yarn")} format
    `;
  }

  if (
    options.solidityFramework === SOLIDITY_FRAMEWORKS.HARDHAT ||
    options.solidityFramework === SOLIDITY_FRAMEWORKS.FOUNDRY
  ) {
    message += `
    \t${chalk.bold("Start the local development node")}
    \t${chalk.dim("yarn")} chain
    `;

    message += `
    \t${chalk.bold("In a new terminal window, deploy your contracts")}
    \t${chalk.dim("yarn")} deploy
   `;
  }

  message += `
  \t${chalk.bold("In a new terminal window, start the frontend")}
  \t${chalk.dim("yarn")} start
  `;

  message += `
  ${chalk.bold.green("Thanks for using Scaffold-ETH 2 🙏, Happy Building!")}
  `;

  console.log(message);
}
