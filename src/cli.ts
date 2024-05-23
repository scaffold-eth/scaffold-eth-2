import { createProject } from "./main";
import { parseArgumentsIntoOptions } from "./utils/parse-arguments-into-options";
import { promptForMissingOptions } from "./utils/prompt-for-missing-options";
import { renderIntroMessage } from "./utils/render-intro-message";
import type { Args } from "./types";
import chalk from "chalk";

export async function cli(args: Args) {
  try {
    renderIntroMessage();
    const rawOptions = await parseArgumentsIntoOptions(args);
    const options = await promptForMissingOptions(rawOptions);
    await createProject(options);
  } catch (error: any) {
    console.error(chalk.red.bold(error.message || "An unknown error occurred."));
    return;
  }
}
