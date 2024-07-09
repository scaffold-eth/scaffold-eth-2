import { execa } from "execa";

// TODO: Instead of using execa, use prettier package from cli to format targetDir
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
