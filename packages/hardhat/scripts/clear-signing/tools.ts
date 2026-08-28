import { spawnSync } from "node:child_process";

const ERC7730_VERSION = "1.0.7";
const CHECK_JSONSCHEMA_VERSION = "0.38.0";
const REGISTRY_SCHEMA_ROOT = "https://raw.githubusercontent.com/ethereum/clear-signing-erc7730-registry/master/specs";

export function runErc7730Lint(descriptorPath: string) {
  const uvResult = spawnSync("uvx", ["--from", `erc7730==${ERC7730_VERSION}`, "erc7730", "lint", descriptorPath], {
    stdio: "inherit",
  });
  if (!uvResult.error && uvResult.status === 0) return;
  if (!isMissingCommand(uvResult.error)) {
    throw new Error(`erc7730 lint failed with exit code ${uvResult.status ?? "unknown"}.`);
  }

  const installedResult = spawnSync("erc7730", ["lint", descriptorPath], { stdio: "inherit" });
  if (!installedResult.error && installedResult.status === 0) return;
  if (isMissingCommand(installedResult.error)) {
    throw new Error(
      `ERC-7730 validation requires uv (recommended) or the erc7730 CLI. Install uv from https://docs.astral.sh/uv/.`,
    );
  }
  throw new Error(`erc7730 lint failed with exit code ${installedResult.status ?? "unknown"}.`);
}

export function runJsonSchemaChecks(descriptorPath: string, fixturePath: string) {
  runCheckJsonschema(`${REGISTRY_SCHEMA_ROOT}/erc7730-v2.schema.json`, descriptorPath);
  runCheckJsonschema(`${REGISTRY_SCHEMA_ROOT}/erc7730-tests-v2.schema.json`, fixturePath);
}

export function runSourcifyVerification(packageRoot: string, network: string) {
  const command = process.platform === "win32" ? "yarn.cmd" : "yarn";
  const result = spawnSync(command, ["verify", "--network", network, "sourcify"], {
    cwd: packageRoot,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`Sourcify verification failed with exit code ${result.status ?? "unknown"}.`);
}

function isMissingCommand(error: Error | undefined) {
  return error != null && "code" in error && error.code === "ENOENT";
}

function runCheckJsonschema(schemaUrl: string, file: string) {
  const args = [
    "--from",
    `check-jsonschema==${CHECK_JSONSCHEMA_VERSION}`,
    "check-jsonschema",
    "--schemafile",
    schemaUrl,
    file,
  ];
  const uvResult = spawnSync("uvx", args, { stdio: "inherit" });
  if (!uvResult.error && uvResult.status === 0) return;
  if (!isMissingCommand(uvResult.error)) {
    throw new Error(`JSON schema validation failed with exit code ${uvResult.status ?? "unknown"}.`);
  }

  const installedResult = spawnSync("check-jsonschema", ["--schemafile", schemaUrl, file], { stdio: "inherit" });
  if (!installedResult.error && installedResult.status === 0) return;
  if (isMissingCommand(installedResult.error)) {
    throw new Error(
      "JSON schema validation requires uv (recommended) or check-jsonschema. Install uv from https://docs.astral.sh/uv/.",
    );
  }
  throw new Error(`JSON schema validation failed with exit code ${installedResult.status ?? "unknown"}.`);
}
