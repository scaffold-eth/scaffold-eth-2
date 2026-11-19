import { DefaultRenderer, ListrTaskWrapper, SimpleRenderer } from "listr2";
import { execaCommand } from "execa";
import chalk from "chalk";

export async function installPackages(
  targetDir: string,
  task: ListrTaskWrapper<any, typeof DefaultRenderer, typeof SimpleRenderer>,
) {
  const execute = execaCommand("yarn install", { cwd: targetDir });

  let outputBuffer: string = "";

  const chunkSize = 1024;
  execute?.stdout?.on("data", (data: Buffer) => {
    outputBuffer += data.toString();

    if (outputBuffer.length > chunkSize) {
      outputBuffer = outputBuffer.slice(-1 * chunkSize);
    }

    const visibleOutput =
      outputBuffer
        .match(new RegExp(`.{1,${chunkSize}}`, "g"))
        ?.slice(-1)
        .map(chunk => chunk.trimEnd() + "\n")
        .join("") ?? outputBuffer;

    task.output = visibleOutput;
    if (visibleOutput.includes("Link step")) {
      task.output = chalk.yellow(`starting link step, this might take a little time...`);
    }
  });

  execute?.stderr?.on("data", (data: Buffer) => {
    outputBuffer += data.toString();

    if (outputBuffer.length > chunkSize) {
      outputBuffer = outputBuffer.slice(-1 * chunkSize);
    }

    const visibleOutput =
      outputBuffer
        .match(new RegExp(`.{1,${chunkSize}}`, "g"))
        ?.slice(-1)
        .map(chunk => chunk.trimEnd() + "\n")
        .join("") ?? outputBuffer;

    task.output = visibleOutput;
  });

  await execute;
}
