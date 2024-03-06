import { execa } from "execa";

export async function prettierFormat(targetDir: string) {
  try {
    const result = await execa("yarn", ["format"], { cwd: targetDir });

    if (result.failed) {
      throw new Error("There was a problem running the format command");
    }
  } catch (error) {
    throw new Error("Failed to create directory", { cause: error });
  }

  return true;
}
