import { projectInstall } from "pkg-install";

export function installPackages(targetDir: string) {
  return projectInstall({
    cwd: targetDir,
    prefer: "yarn",
  });
}
