// Deploys from the monorepo root so Vercel installs with the root yarn.lock, resolutions and .yarnrc.yml.
// The Vercel project builds packages/nextjs (its Root Directory). Arguments are passed to `vercel deploy`.
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const vercelCli = createRequire(import.meta.url).resolve("vercel/dist/vc.js");
const args = process.argv.slice(2);
const yes = args.includes("--yes") || args.includes("-y");

// Runs the CLI at the repo root and exits on failure. With stdout "pipe" it returns the CLI's stdout.
const vercel = (cliArgs, stdout = "inherit") => {
  const result = spawnSync(process.execPath, [vercelCli, ...cliArgs], {
    cwd: repoRoot,
    stdio: ["inherit", stdout, "inherit"],
    encoding: "utf8",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result.stdout;
};

const linkDir = path.join(repoRoot, ".vercel");
const linkedNow = !existsSync(path.join(linkDir, "project.json"));
if (linkedNow) {
  // `vercel link` rejects deploy-only flags like --prod, so it only gets the ones that skip its questions
  const linkArgs = args.flatMap((arg, i) => {
    if (["--yes", "-y"].includes(arg) || arg.startsWith("--scope=")) return [arg];
    return ["--scope", "-S"].includes(arg) ? args.slice(i, i + 2) : [];
  });
  vercel(["link", ...linkArgs]);
}

// Without both settings the build succeeds but every URL returns 404
const settings = ["--root-directory", "packages/nextjs", "--framework", "nextjs"];
const settingsApplied = () => {
  const project = JSON.parse(vercel(["project", "inspect", "--json"], "pipe"));
  return project.rootDirectory === "packages/nextjs" && project.framework === "nextjs";
};

if (!settingsApplied()) {
  const { deployments } = JSON.parse(vercel(["ls", "--json", "--limit", "1"], "pipe"));
  if (yes || deployments.length === 0) {
    vercel(["project", "update", ...settings, "--yes"]);
  } else {
    // The project already has deployments, maybe it was picked by mistake. The CLI shows the changes and asks
    // (default No), or exits with an error when there is no terminal. A "No" exits 0, so check the settings again.
    vercel(["project", "update", ...settings]);
    if (!settingsApplied()) {
      if (linkedNow) rmSync(linkDir, { recursive: true, force: true });
      console.log(
        "Nothing was deployed. To deploy to a new project, run `yarn vercel` again and choose `Create a new project`.",
      );
      process.exit(1);
    }
  }
}

vercel(["deploy", ...args]);
