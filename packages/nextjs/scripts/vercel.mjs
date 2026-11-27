// Deploys from the monorepo root so Vercel installs with the root yarn.lock, resolutions and .yarnrc.yml.
// The Vercel project builds packages/nextjs (its Root Directory). Arguments are passed to `vercel deploy`.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const vercelCli = createRequire(import.meta.url).resolve("vercel/dist/vc.js");
const args = process.argv.slice(2);

const vercel = cliArgs => {
  const { status } = spawnSync(process.execPath, [vercelCli, ...cliArgs], { cwd: repoRoot, stdio: "inherit" });
  if (status !== 0) process.exit(status ?? 1);
};

if (!existsSync(path.join(repoRoot, ".vercel", "project.json"))) {
  // `vercel link` rejects deploy-only flags like --prod, so it only gets the ones that skip its questions
  const linkArgs = args.flatMap((arg, i) => {
    if (["--yes", "-y"].includes(arg) || arg.startsWith("--scope=")) return [arg];
    return ["--scope", "-S"].includes(arg) ? args.slice(i, i + 2) : [];
  });
  vercel(["link", ...linkArgs]);
}

// Also runs when the root was linked by hand, since the build 404s without these settings
vercel(["project", "update", "--root-directory", "packages/nextjs", "--framework", "nextjs", "--yes"]);
vercel(["deploy", ...args]);
