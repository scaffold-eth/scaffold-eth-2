import { spawnSync } from "node:child_process";
import type { ValidationEvidence } from "./types.js";

const ERC7730_VERSION = "1.0.7";
const CHECK_JSONSCHEMA_VERSION = "0.38.0";
const REGISTRY_COMMIT = "8936407e503b319882d3c811c26c8648a8e449ca";
const REGISTRY_SCHEMA_ROOT = `https://raw.githubusercontent.com/ethereum/clear-signing-erc7730-registry/${REGISTRY_COMMIT}/specs`;

export function runErc7730Lint(descriptorPath: string) {
  const result = runPinnedUvTool(
    ["--from", `erc7730==${ERC7730_VERSION}`, "erc7730", "lint", "--gha", "--skip-abi-validation", descriptorPath],
    "erc7730 lint",
    [/^::warning .*title=Could not fetch ABI::/i],
  );
  return {
    command: "erc7730 lint" as const,
    version: ERC7730_VERSION,
    descriptorWarnings: "rejected" as const,
    abiValidation: "skipped-in-favor-of-sourcify" as const,
    ignoredInfrastructureWarnings:
      result.ignoredWarnings.length > 0
        ? [
            "The ERC-7730 v2 linter could not fetch an explorer ABI; exact ABI validation was performed with Sourcify instead.",
          ]
        : [],
  };
}

export function runJsonSchemaChecks(descriptorPath: string, fixturePath: string) {
  const descriptor = `${REGISTRY_SCHEMA_ROOT}/erc7730-v2.schema.json`;
  const fixture = `${REGISTRY_SCHEMA_ROOT}/erc7730-tests-v2.schema.json`;
  runCheckJsonschema(descriptor, descriptorPath);
  runCheckJsonschema(fixture, fixturePath);
  return {
    validator: "check-jsonschema" as const,
    validatorVersion: CHECK_JSONSCHEMA_VERSION,
    registryCommit: REGISTRY_COMMIT,
    descriptor,
    fixture,
  } satisfies ValidationEvidence["schemas"];
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
  runPinnedUvTool(args, "JSON schema validation");
}

function runPinnedUvTool(args: string[], description: string, ignoredWarningPatterns: RegExp[] = []) {
  const result = spawnSync("uvx", args, { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (isMissingCommand(result.error)) {
    throw new Error(`${description} requires uv. Install it from https://docs.astral.sh/uv/.`);
  }
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${description} failed with exit code ${result.status ?? "unknown"}.`);

  const output = stripAnsi(`${result.stdout ?? ""}\n${result.stderr ?? ""}`);
  const warningAnnotations = output.split("\n").filter(line => /^::warning\b/i.test(line));
  const unexpectedAnnotations = warningAnnotations.filter(
    line => !ignoredWarningPatterns.some(pattern => pattern.test(line)),
  );
  const hasUnstructuredWarning = warningAnnotations.length === 0 && /(^|\n)[^\n]*\bwarning\b/i.test(output);
  if (unexpectedAnnotations.length > 0 || hasUnstructuredWarning) {
    throw new Error(`${description} emitted a warning; resolve it before preparing a submission.`);
  }
  return {
    ignoredWarnings: warningAnnotations.filter(line => ignoredWarningPatterns.some(pattern => pattern.test(line))),
  };
}

function stripAnsi(value: string) {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}
