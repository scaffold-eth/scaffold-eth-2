import {
  copyTemplateFiles,
  createProjectDirectory,
  installPackages,
  createFirstGitCommit,
  prettierFormat,
} from "./tasks";
import type { Options } from "./types";
import { renderOutroMessage } from "./utils/render-outro-message";
import chalk from "chalk";
import Listr from "listr";
import path from "path";
import { fileURLToPath } from "url";

export async function createProject(options: Options) {
  console.log(`\n`);

  const currentFileUrl = import.meta.url;

  const templateDirectory = path.resolve(
    decodeURI(fileURLToPath(currentFileUrl)),
    "../../templates"
  );

  const targetDirectory = path.resolve(process.cwd(), options.project);

  const tasks = new Listr([
    {
      title: `📁 Create project directory ${targetDirectory}`,
      task: () => createProjectDirectory(options.project),
    },
    {
      title: `🚀 Creating a new Scaffold-ETH 2 app in ${chalk.green.bold(
        options.project
      )}`,
      task: () =>
        copyTemplateFiles(options, templateDirectory, targetDirectory),
    },
    {
      title: `📦 Installing dependencies with yarn, this could take a while`,
      task: () => installPackages(targetDirectory),
      skip: () => {
        if (!options.install) {
          return "Manually skipped";
        }
      },
    },
    {
      title: "🪄 Formatting files with prettier",
      task: () => prettierFormat(targetDirectory),
      skip: () => {
        if (!options.install) {
          return "Skipping because prettier install was skipped";
        }
      },
    },
    {
      title: `📡 Initializing Git repository${
        options.extensions.includes("foundry") ? " and submodules" : ""
      }`,
      task: () => createFirstGitCommit(targetDirectory, options),
    },
  ]);

  try {
    await tasks.run();
    renderOutroMessage(options);
  } catch (error) {
    console.log("%s Error occurred", chalk.red.bold("ERROR"), error);
    console.log("%s Exiting...", chalk.red.bold("Uh oh! 😕 Sorry about that!"));
  }
}
