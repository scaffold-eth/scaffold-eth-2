// Deploys from the monorepo root so Vercel installs with the root yarn.lock, resolutions and .yarnrc.yml.
// The Vercel project builds packages/nextjs (its Root Directory). Arguments are passed to `vercel deploy`.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { isatty } from "node:tty";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const vercelCli = createRequire(import.meta.url).resolve("vercel/dist/vc.js");
const args = process.argv.slice(2);
const yes = args.includes("--yes") || args.includes("-y");

// Runs the CLI at the repo root and exits on failure. With stdout "pipe" it returns the CLI's stdout.
// Without a terminal the CLI gets no stdin, because it can wait forever on a pipe that stays open.
const vercel = (cliArgs, stdout = "inherit") => {
  const result = spawnSync(process.execPath, [vercelCli, ...cliArgs], {
    cwd: repoRoot,
    stdio: [isatty(0) ? "inherit" : "ignore", stdout, "inherit"],
    encoding: "utf8",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result.stdout;
};

// Help and dry runs change nothing, so they skip the link and the settings check
if (["--help", "-h", "--dry"].some(flag => args.includes(flag))) {
  vercel(["deploy", ...args]);
  process.exit(0);
}

// The user's flags that pick the account, team and project, in `--flag value` or `--flag=value` form
const pickFlags = flags =>
  args.flatMap((arg, i) => {
    if (flags.includes(arg)) return args.slice(i, i + 2);
    return flags.some(flag => arg.startsWith(`${flag}=`)) ? [arg] : [];
  });
const account = pickFlags(["--token", "-t", "--scope", "-S", "--team", "-T"]);
const projectFlag = pickFlags(["--project"]);
// `project inspect`, `project update` and `ls` take the project as an argument, not as a flag
const project = projectFlag.slice(-1).map(arg => arg.replace(/^--project=/, ""));

const rootLink = path.join(repoRoot, ".vercel", "project.json");
const oldLink = path.join(repoRoot, "packages", "nextjs", ".vercel", "project.json");
const usesOldLink = !existsSync(rootLink) && existsSync(oldLink);
if (usesOldLink) {
  // Earlier versions of this script linked packages/nextjs, so keep deploying to that project
  const { projectId, orgId } = JSON.parse(readFileSync(oldLink, "utf8"));
  mkdirSync(path.dirname(rootLink), { recursive: true });
  writeFileSync(rootLink, JSON.stringify({ projectId, orgId }));
} else if (!existsSync(rootLink)) {
  // `vercel link` rejects deploy-only flags like --prod, so it only gets the ones it understands
  vercel(["link", ...(yes ? ["--yes"] : []), ...account, ...projectFlag]);
}

// Without both settings the build succeeds but every URL returns 404
const settings = ["--root-directory", "packages/nextjs", "--framework", "nextjs"];
const settingsApplied = () => {
  const { rootDirectory, framework } = JSON.parse(
    vercel(["project", "inspect", ...project, "--json", ...account], "pipe"),
  );
  return rootDirectory === "packages/nextjs" && framework === "nextjs";
};
const hasDeployments = () =>
  JSON.parse(vercel(["ls", ...project, "--json", "--limit", "1", ...account], "pipe")).deployments.length > 0;

if (!settingsApplied()) {
  if (yes || !hasDeployments()) {
    vercel(["project", "update", ...project, ...settings, "--yes", ...account]);
  } else {
    // The project already has deployments, maybe it was picked by mistake. The CLI shows the changes and asks
    // (default No), or exits with an error when there is no terminal. A "No" exits 0, so check the settings again.
    vercel(["project", "update", ...project, ...settings, ...account]);
    if (!settingsApplied()) {
      // Remove only the link, so the next run asks which project to use
      rmSync(rootLink, { force: true });
      console.log(
        usesOldLink
          ? "Nothing was deployed. `packages/nextjs/.vercel` links this project, so delete that folder, then run `yarn vercel` again to choose another project."
          : "Nothing was deployed. Run `yarn vercel` again to choose another project, for example `Create a new project`.",
      );
      process.exit(1);
    }
  }
}

vercel(["deploy", ...args]);
