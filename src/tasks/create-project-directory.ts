import { execa } from "execa";

export async function createProjectDirectory(projectName: string) {
  try {
    const result = await execa("mkdir", [projectName]);

    if (result.failed) {
      throw new Error("There was a problem running the mkdir command");
    }
  } catch (error) {
    throw new Error("Failed to create directory", { cause: error });
  }

  return true;
}
