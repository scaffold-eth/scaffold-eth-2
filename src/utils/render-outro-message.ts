import chalk from "chalk";
import type { Options } from "../types";
export function renderOutroMessage(options: Options): void {
  let message = `
  \n
  ${chalk.bold.green("Congratulations!")} Your project has been scaffolded! 🎉
  \n
  ${chalk.bold("Next steps:")}
    \n
  ${chalk.dim("cd")} ${options.project}
  `;

  message += `
  \n
  ${chalk.bold.green("Thanks for using Scaffold-ETH 2 🙏, Happy Building!")}
  `;

  console.log(message);
}
