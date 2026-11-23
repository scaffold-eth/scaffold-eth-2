import { execa } from "execa";
import fs from "fs";
import path from "path";

export async function createProjectDirectory(projectName: string) {
  const resolvedPath = path.resolve(projectName);

  if (fs.existsSync(resolvedPath)) {
    const files = fs.readdirSync(resolvedPath);
    if (files.length > 0) {
      throw new Error(`Directory ${resolvedPath} is not empty`);
    }
    return true;
  }

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
