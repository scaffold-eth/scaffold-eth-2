// Builds the static export and uploads `out/` to BuidlGuidl IPFS (`yarn ipfs`).
import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

const UPLOAD_URL = "https://upload.bgipfs.com";
const GATEWAY_URL = "https://community.bgipfs.com/ipfs";
const shell = process.platform === "win32";

const fail = message => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

const yarn = (args, env = {}) => {
  const { status } = spawnSync("yarn", args, { stdio: "inherit", env: { ...process.env, ...env }, shell });
  return status === 0;
};

// `next dev` keeps route types in .next/dev/types, and the build type-checks them:
// a route deleted since the last dev run fails the build with TS2307.
rmSync(".next/dev/types", { recursive: true, force: true });

if (!process.env.NEXT_PUBLIC_PRODUCTION_URL?.trim()) {
  console.warn(
    "⚠️  NEXT_PUBLIC_PRODUCTION_URL is not set, so Open Graph and Twitter metadata will point at localhost.\n" +
      '   Set it to the site\'s final URL, e.g. NEXT_PUBLIC_PRODUCTION_URL="https://myapp.eth.limo" yarn ipfs\n',
  );
}

if (!yarn(["build"], { NEXT_PUBLIC_IPFS_BUILD: "true" })) fail("Build failed");
if (!yarn(["bgipfs", "upload", "config", "init", "-u", UPLOAD_URL])) fail("Upload config failed");

// stdout is echoed while it's read for the CID, so bgipfs's keystore password
// prompt stays visible (a `$(...)` capture used to hide it).
const upload = spawn("yarn", ["bgipfs", "upload", "out"], { stdio: ["inherit", "pipe", "inherit"], shell });
let output = "";
upload.stdout.on("data", chunk => {
  process.stdout.write(chunk);
  output += chunk;
});
upload.on("error", () => fail("Upload failed"));
upload.on("close", code => {
  const cid = output.replace(/\x1b\[[0-9;]*m/g, "").match(/CID: (\S+)/)?.[1];
  if (!cid) fail("Upload failed");
  console.log(`🚀 Upload complete! Your site is now available at: ${GATEWAY_URL}/${cid}`);
  // bgipfs prints the CID and still exits 1 when some of the configured nodes failed
  if (code !== 0) fail("Upload finished with errors (see above)");
});
