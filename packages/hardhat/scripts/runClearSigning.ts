import { access, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  CHAIN_METADATA_COMMIT,
  createConfig,
  createProvenance,
  generateArtifacts,
  getConfigPath,
  printPreviews,
  readConfig,
  relativeToPackage,
  writeJson,
  writeText,
} from "./clear-signing/core.js";
import { loadRockethDeployment } from "./clear-signing/rocketh.js";
import { checkSourcify } from "./clear-signing/sourcify.js";
import { runErc7730Lint, runJsonSchemaChecks, runSourcifyVerification } from "./clear-signing/tools.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type CliOptions = {
  network?: string;
  contract?: string;
  entity?: string;
  owner?: string;
  url?: string;
  "skip-sourcify"?: boolean;
  "verify-sourcify"?: boolean;
  help?: boolean;
};

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    strict: true,
    options: {
      network: { type: "string" },
      contract: { type: "string" },
      entity: { type: "string" },
      owner: { type: "string" },
      url: { type: "string" },
      "skip-sourcify": { type: "boolean", default: false },
      "verify-sourcify": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const options = values as CliOptions;
  const command = positionals[0];

  if (options.help || !command) {
    printHelp();
    return;
  }
  if (positionals.length > 1) throw new Error(`Unexpected positional argument: ${positionals[1]}`);

  if (command === "init") await init(options);
  else if (command === "check") await check(options);
  else if (command === "prepare") await prepare(options);
  else throw new Error(`Unknown command: ${command}. Expected init, check, or prepare.`);
}

async function init(options: CliOptions) {
  const network = requireOption(options.network, "--network");
  const contractName = requireOption(options.contract, "--contract");
  const entity = requireOption(options.entity, "--entity");
  const url = requireOption(options.url, "--url");
  const deployment = await loadRockethDeployment(packageRoot, network, contractName);
  const configPath = getConfigPath(packageRoot, network, contractName);

  if (await exists(configPath)) {
    throw new Error(`Clear-signing config already exists at ${configPath}. It was not overwritten.`);
  }

  const config = createConfig(deployment, { entity, owner: options.owner ?? entity, url });
  try {
    await writeJson(configPath, config, { exclusive: true });
  } catch (error) {
    if (isAlreadyExists(error))
      throw new Error(`Clear-signing config already exists at ${configPath}. It was not overwritten.`);
    throw error;
  }
  console.log(`Created ${relativeToPackage(packageRoot, configPath)}.`);
  console.log(
    "Select functions with include, author their intent and fields, provide representative test values, then run check.",
  );
  console.log("After inspecting the preview, set reviewed to true before running prepare.");
  console.log(`Next: yarn clear-signing check --network ${network} --contract ${contractName}`);
}

async function check(options: CliOptions) {
  const { deployment, config, artifacts } = await buildAndValidate(options, {
    skipSourcify: Boolean(options["skip-sourcify"]),
    requireReviewed: false,
  });
  printPreviews(artifacts.previews);
  console.log(`\nDescriptor: ${relativeToPackage(packageRoot, artifacts.descriptorPath)}`);
  console.log(`Fixtures:   ${relativeToPackage(packageRoot, artifacts.fixturePath)}`);
  if (options["skip-sourcify"]) {
    console.log("Sourcify verification was skipped; this output is not ready for registry submission.");
  } else if (
    Object.values(config.functions).some(functionConfig => functionConfig.include && !functionConfig.reviewed)
  ) {
    console.log("Mechanical checks passed. Review the preview and set reviewed to true before preparing a submission.");
  } else {
    console.log(`Checks passed for ${deployment.address} on chain ${deployment.chainId}.`);
  }
}

async function prepare(options: CliOptions) {
  if (options["skip-sourcify"])
    throw new Error("prepare cannot skip Sourcify because the registry requires verification.");
  const { deployment, config, artifacts, sourcify, validation } = await buildAndValidate(options, {
    skipSourcify: false,
    requireReviewed: true,
  });
  if (!sourcify) throw new Error("Sourcify evidence is required to prepare a submission.");

  const submissionRoot = join(packageRoot, "clear-signing", deployment.network, "submission");
  const entityDirectory = join(submissionRoot, "registry", config.entity);
  const descriptorTarget = join(entityDirectory, `calldata-${deployment.contractName}.json`);
  const fixtureTarget = join(entityDirectory, "testsv2", `calldata-${deployment.contractName}.tests.json`);
  await mkdir(dirname(fixtureTarget), { recursive: true });
  await writeJson(descriptorTarget, artifacts.descriptor);
  await writeJson(fixtureTarget, artifacts.fixtures);
  await writeJson(
    join(submissionRoot, "provenance.json"),
    createProvenance(deployment, artifacts, sourcify, validation),
  );
  await writeText(
    join(submissionRoot, "SUBMISSION.md"),
    submissionInstructions(config.entity, deployment.contractName),
  );

  printPreviews(artifacts.previews);
  console.log(`\nPrepared ${relativeToPackage(packageRoot, submissionRoot)}.`);
  console.log(`Copy registry/${config.entity} into the ERC-7730 registry and open a pull request.`);
  console.log("The provenance report records mechanical checks only; it is not an audit or safety endorsement.");
}

async function buildAndValidate(options: CliOptions, validation: { skipSourcify: boolean; requireReviewed: boolean }) {
  const network = requireOption(options.network, "--network");
  const contractName = requireOption(options.contract, "--contract");
  const deployment = await loadRockethDeployment(packageRoot, network, contractName);
  const configPath = getConfigPath(packageRoot, network, contractName);
  if (!(await exists(configPath))) {
    throw new Error(`No config found at ${configPath}. Run yarn clear-signing init first.`);
  }
  const config = await readConfig(configPath);

  if (options["verify-sourcify"]) runSourcifyVerification(packageRoot, network);
  const sourcify = validation.skipSourcify ? undefined : await checkSourcify(deployment);
  const artifacts = await generateArtifacts(packageRoot, config, deployment, {
    requireReviewed: validation.requireReviewed,
  });
  const linter = runErc7730Lint(artifacts.descriptorPath);
  const schemas = runJsonSchemaChecks(artifacts.descriptorPath, artifacts.fixturePath);
  return {
    deployment,
    config,
    artifacts,
    sourcify,
    validation: {
      formatter: {
        package: "@ethereum-sourcify/clear-signing" as const,
        version: "0.2.2",
        warnings: "rejected" as const,
        chainMetadata: {
          repository: "ethereum-lists/chains" as const,
          commit: CHAIN_METADATA_COMMIT,
        },
      },
      linter,
      schemas,
    },
  };
}

function submissionInstructions(entity: string, contractName: string) {
  return `# ERC-7730 submission\n\nCopy \`registry/${entity}\` into a checkout of the Ethereum ERC-7730 registry and open a pull request. The bundle contains:\n\n- \`registry/${entity}/calldata-${contractName}.json\`\n- \`registry/${entity}/testsv2/calldata-${contractName}.tests.json\`\n\nRun the registry's current CI commands from that checkout before submitting. The relative \`$schema\` links resolve after the entity folder is copied into the registry. Do not copy \`provenance.json\` into the entity folder unless the registry adopts a provenance-file convention.\n\n## Trust boundary\n\nThe generated provenance report covers deployment metadata, exact normalized function-ABI equality, full Sourcify verification, pinned descriptor linting, schema validation, and fixture self-consistency. Fixture expectations are generated from the same descriptor and are not an independent semantic oracle. This workflow does not claim that the descriptor or contract was independently audited, attested, or found safe.\n`;
}

function requireOption(value: string | undefined, option: string) {
  if (!value) throw new Error(`${option} is required.`);
  return value;
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function isAlreadyExists(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}

function printHelp() {
  console.log(
    `ERC-7730 Clear Signing workflow\n\nUsage:\n  yarn clear-signing init --network <network> --contract <name> --entity <registry-folder> --url <url> [--owner <name>]\n  yarn clear-signing check --network <network> --contract <name> [--skip-sourcify] [--verify-sourcify]\n  yarn clear-signing prepare --network <network> --contract <name> [--verify-sourcify]\n\nCommands:\n  init      Read a Rocketh deployment and create an author-owned config.\n  check     Generate, lint, render, and validate the descriptor and test fixtures.\n  prepare   Repeat all checks and create a registry-shaped submission bundle.\n\nNotes:\n  - init never overwrites an existing config.\n  - --verify-sourcify delegates to the existing yarn verify flow before checking.\n  - --skip-sourcify is for draft checks only and cannot be used with prepare.\n  - This workflow establishes provenance and consistency, not audit or contract safety.\n`,
  );
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
