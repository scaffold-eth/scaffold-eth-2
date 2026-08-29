import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import {
  format,
  isFieldGroup,
  type DisplayField as LibraryDisplayField,
  type DisplayFieldGroup,
  type DisplayModel,
  type Warning,
} from "@ethereum-sourcify/clear-signing";
import { createFilesystemResolver } from "@ethereum-sourcify/clear-signing/filesystem";
import { getAddress, Interface, Transaction, type InterfaceAbi } from "ethers";
import type {
  AbiFunction,
  AbiItem,
  AbiParameter,
  ClearSigningConfig,
  ClearSigningDeployment,
  ClearSigningFunctionConfig,
  DataProvider,
  DisplayField,
  Erc7730Descriptor,
  FixtureFile,
  GeneratedArtifacts,
  RenderedDisplay,
  RenderedField,
  SourcifyEvidence,
  ValidationEvidence,
} from "./types.js";

export const DESCRIPTOR_SCHEMA = "../../specs/erc7730-v2.schema.json";
export const FIXTURE_SCHEMA = "../../../specs/erc7730-tests-v2.schema.json";
export const CHAIN_METADATA_COMMIT = "e198a42191481c2074384aa7b176a94b20869758";

export function getConfigPath(packageRoot: string, network: string, contractName: string) {
  return join(packageRoot, "clear-signing", network, `${contractName}.config.json`);
}

export function createConfig(
  deployment: ClearSigningDeployment,
  options: { entity: string; owner: string; url: string },
): ClearSigningConfig {
  assertEntity(options.entity);
  assertHttpUrl(options.url);

  const functions = Object.fromEntries(
    getWritableFunctions(deployment.abi).map(fn => {
      const signature = formatFunctionSignature(fn);
      return [signature, createFunctionConfig(fn)];
    }),
  );

  if (Object.keys(functions).length === 0) {
    throw new Error(`${deployment.contractName} has no non-view functions that can be described for calldata signing.`);
  }

  return {
    version: 1,
    network: deployment.network,
    contract: deployment.contractName,
    entity: options.entity,
    metadata: {
      owner: options.owner,
      contractName: deployment.contractName,
      info: { url: options.url },
    },
    functions,
    dataProvider: {},
  };
}

export async function readConfig(path: string): Promise<ClearSigningConfig> {
  const config = JSON.parse(await readFile(path, "utf8")) as unknown;
  if (!isRecord(config)) throw new Error(`Clear-signing config at ${path} must be a JSON object.`);
  if (config.version !== 1) throw new Error(`Unsupported clear-signing config version in ${path}.`);
  return config as ClearSigningConfig;
}

export async function writeJson(path: string, value: unknown, options: { exclusive?: boolean } = {}) {
  await writeText(path, `${JSON.stringify(value, null, 2)}\n`, options);
}

export async function writeText(path: string, value: string, options: { exclusive?: boolean } = {}) {
  await mkdir(dirname(path), { recursive: true });
  if (options.exclusive) {
    await writeFile(path, value, { encoding: "utf8", flag: "wx" });
    return;
  }

  const temporaryPath = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryPath, value, { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, path);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export function validateConfig(
  config: ClearSigningConfig,
  deployment: ClearSigningDeployment,
  options: { requireReviewed?: boolean } = {},
): string[] {
  const errors: string[] = [];
  const rawConfig = config as unknown as Record<string, unknown>;

  if (rawConfig.network !== deployment.network)
    errors.push(`Config network is ${String(rawConfig.network)}, expected ${deployment.network}.`);
  if (rawConfig.contract !== deployment.contractName) {
    errors.push(`Config contract is ${String(rawConfig.contract)}, expected ${deployment.contractName}.`);
  }

  try {
    assertEntity(rawConfig.entity);
  } catch (error) {
    errors.push(errorMessage(error));
  }
  const metadata = isRecord(rawConfig.metadata) ? rawConfig.metadata : undefined;
  const info = isRecord(metadata?.info) ? metadata.info : undefined;
  try {
    assertHttpUrl(info?.url);
  } catch (error) {
    errors.push(errorMessage(error));
  }
  if (typeof metadata?.owner !== "string" || !metadata.owner.trim()) errors.push("metadata.owner must not be empty.");
  if (typeof metadata?.contractName !== "string" || !metadata.contractName.trim())
    errors.push("metadata.contractName must not be empty.");

  if (rawConfig.dataProvider !== undefined) {
    if (!isRecord(rawConfig.dataProvider)) {
      errors.push("dataProvider must be an object.");
    } else {
      for (const key of ["tokens", "addressNames", "ensNames", "nftCollectionNames", "blockTimestamps"]) {
        const value = rawConfig.dataProvider[key];
        if (value !== undefined && !isRecord(value)) errors.push(`dataProvider.${key} must be an object.`);
      }
    }
  }

  if (!isRecord(rawConfig.functions)) {
    errors.push("functions must be an object.");
    return errors;
  }

  const writableBySignature = new Map(
    getWritableFunctions(deployment.abi).map(fn => [formatFunctionSignature(fn), fn]),
  );
  const functionEntries = Object.entries(rawConfig.functions);
  const included: Array<[string, Record<string, unknown>]> = [];
  for (const [signature, value] of functionEntries) {
    if (!isRecord(value)) {
      errors.push(`${signature}: function config must be an object.`);
      continue;
    }
    if (typeof value.include !== "boolean") errors.push(`${signature}: include must be a boolean.`);
    if (typeof value.reviewed !== "boolean") errors.push(`${signature}: reviewed must be a boolean.`);
    if (value.include === true) included.push([signature, value]);
  }
  if (included.length === 0) errors.push("Select at least one function by setting include to true.");

  const descriptions = new Map<string, string[]>();
  for (const [signature, functionConfig] of included) {
    const abiFunction = writableBySignature.get(signature);
    if (!abiFunction) {
      errors.push(`${signature}: function is not a non-view function in the deployment ABI.`);
      continue;
    }
    if (options.requireReviewed !== false && !functionConfig.reviewed)
      errors.push(`${signature}: set reviewed to true after checking its semantics and preview.`);
    if (typeof functionConfig.intent !== "string" || !functionConfig.intent.trim())
      errors.push(`${signature}: intent must not be empty.`);

    const test = isRecord(functionConfig.test) ? functionConfig.test : undefined;
    if (!test) errors.push(`${signature}: test must be an object.`);
    const description = typeof test?.description === "string" ? test.description.trim() : "";
    if (!description) errors.push(`${signature}: test.description must not be empty.`);
    else descriptions.set(description, [...(descriptions.get(description) ?? []), signature]);
    if (!Array.isArray(test?.args)) errors.push(`${signature}: test.args must be an array.`);
    if ((Array.isArray(test?.args) ? test.args.length : -1) !== (abiFunction.inputs?.length ?? 0)) {
      errors.push(`${signature}: expected ${abiFunction.inputs?.length ?? 0} test arguments.`);
    }
    if ((abiFunction.inputs?.length ?? 0) > 0 && !Array.isArray(functionConfig.fields)) {
      errors.push(`${signature}: fields must be an array.`);
    } else if (Array.isArray(functionConfig.fields) && functionConfig.fields.some(field => !isRecord(field))) {
      errors.push(`${signature}: every field must be an object.`);
    }

    if (test?.value !== undefined && typeof test.value !== "string") {
      errors.push(`${signature}: test.value must be a decimal wei string.`);
    } else {
      try {
        const value = normalizeValue(test?.value as string | undefined);
        if (abiFunction.stateMutability !== "payable" && value !== 0n)
          errors.push(`${signature}: nonpayable functions cannot have a nonzero test.value.`);
      } catch (error) {
        errors.push(`${signature}: ${errorMessage(error)}`);
      }
    }
    if (test?.from !== undefined && typeof test.from !== "string") {
      errors.push(`${signature}: test.from must be an Ethereum address string.`);
    } else if (test?.from) {
      try {
        getAddress(test.from as string);
      } catch {
        errors.push(`${signature}: test.from is not a valid Ethereum address.`);
      }
    }
  }

  for (const [description, signatures] of descriptions) {
    if (signatures.length > 1)
      errors.push(`test.description must be unique; "${description}" is used by ${signatures.join(", ")}.`);
  }

  for (const signature of Object.keys(rawConfig.functions)) {
    if (!writableBySignature.has(signature))
      errors.push(`${signature}: config entry no longer matches the deployment ABI.`);
  }

  return errors;
}

export async function generateArtifacts(
  packageRoot: string,
  config: ClearSigningConfig,
  deployment: ClearSigningDeployment,
  options: { requireReviewed?: boolean } = {},
): Promise<GeneratedArtifacts> {
  const validationErrors = validateConfig(config, deployment, options);
  if (validationErrors.length > 0) throw new Error(formatValidationErrors(validationErrors));

  const outputRoot = join(packageRoot, "clear-signing", deployment.network);
  const entityDirectory = join(outputRoot, "registry", config.entity);
  const descriptorName = `calldata-${deployment.contractName}.json`;
  const descriptorPath = join(entityDirectory, descriptorName);
  const fixturePath = join(entityDirectory, "testsv2", `calldata-${deployment.contractName}.tests.json`);
  const descriptor = buildDescriptor(config, deployment);
  await writeJson(descriptorPath, descriptor);

  const previews = [];
  const tests = [];
  for (const [signature, functionConfig] of Object.entries(config.functions)) {
    if (!functionConfig.include) continue;
    const transaction = buildUnsignedTransaction(deployment, signature, functionConfig);
    const rendered = await renderPreview(
      descriptorPath,
      descriptor,
      transaction,
      functionConfig.test.from,
      config.dataProvider,
    );
    previews.push({ signature, rendered });
    tests.push({
      description: functionConfig.test.description,
      rawTx: transaction.rawTx,
      ...(functionConfig.test.from ? { from: getAddress(functionConfig.test.from) } : {}),
      expected: rendered,
    });
  }

  const fixtures: FixtureFile = {
    $schema: FIXTURE_SCHEMA,
    descriptor: `../${descriptorName}`,
    ...(hasEntries(config.dataProvider) ? { dataProvider: config.dataProvider } : {}),
    tests,
  };
  await writeJson(fixturePath, fixtures);

  return { descriptor, fixtures, descriptorPath, fixturePath, previews };
}

export function buildDescriptor(config: ClearSigningConfig, deployment: ClearSigningDeployment): Erc7730Descriptor {
  const formats = Object.fromEntries(
    Object.entries(config.functions)
      .filter(([, value]) => value.include)
      .map(([signature, value]) => [
        signature,
        {
          $id: functionId(signature),
          intent: value.intent,
          ...(value.interpolatedIntent?.trim() ? { interpolatedIntent: value.interpolatedIntent } : {}),
          fields: value.fields,
        },
      ]),
  );

  return {
    $schema: DESCRIPTOR_SCHEMA,
    context: {
      $id: deployment.contractName,
      contract: { deployments: [{ chainId: deployment.chainId, address: deployment.address }] },
    },
    metadata: config.metadata,
    display: { formats },
  };
}

export function createProvenance(
  deployment: ClearSigningDeployment,
  artifacts: GeneratedArtifacts,
  sourcify: SourcifyEvidence,
  validation: ValidationEvidence,
) {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    deployment: {
      network: deployment.network,
      chainId: deployment.chainId,
      address: deployment.address,
      contractName: deployment.contractName,
      deploymentFile: `deployments/${deployment.network}/${deployment.contractName}.json`,
      transactionHash: deployment.transactionHash,
      blockNumber: deployment.blockNumber,
    },
    sourceVerification: { provider: "Sourcify", ...sourcify },
    validation,
    descriptor: {
      file: basename(artifacts.descriptorPath),
      sha256: sha256(artifacts.descriptor),
    },
    fixture: {
      file: basename(artifacts.fixturePath),
      sha256: sha256(artifacts.fixtures),
    },
    establishes: [
      "The descriptor is bound to the recorded deployment address and chain ID.",
      "The normalized deployment function ABI exactly matches the normalized Sourcify function ABI.",
      "The descriptor passed the pinned lint, schema, and fixture self-consistency checks; formatter and descriptor warnings were rejected, and any replaced infrastructure warning is recorded.",
    ],
    doesNotEstablish: [
      "The contract is safe or free of vulnerabilities.",
      "The descriptor has been independently audited or attested.",
      "The human-authored intents and labels cover every runtime behavior.",
      "The generated fixture expectations are an independent semantic oracle; they are produced from the descriptor being tested.",
    ],
  };
}

export function printPreviews(previews: GeneratedArtifacts["previews"]) {
  for (const { signature, rendered } of previews) {
    console.log(`\n${signature}`);
    console.log(`  Intent: ${rendered.interpolatedIntent ?? rendered.intent}`);
    if (rendered.owner) console.log(`  Owner: ${rendered.owner}`);
    for (const field of rendered.fields) console.log(`  ${field.label}: ${renderValue(field.value)}`);
  }
}

export function formatFunctionSignature(fn: AbiFunction): string {
  const inputs = (fn.inputs ?? []).map((input, index) => formatNamedParameter(input, `arg${index}`)).join(",");
  return `${fn.name}(${inputs})`;
}

export function canonicalFunctionSignature(fn: AbiFunction): string {
  return `${fn.name}(${(fn.inputs ?? []).map(canonicalParameterType).join(",")})`;
}

export function getWritableFunctions(abi: AbiItem[]): AbiFunction[] {
  return abi.filter(
    (item): item is AbiFunction =>
      item.type === "function" &&
      typeof item.name === "string" &&
      (item.stateMutability === "nonpayable" || item.stateMutability === "payable"),
  );
}

export function getAbiFunctions(abi: AbiItem[]): AbiFunction[] {
  return abi.filter((item): item is AbiFunction => item.type === "function" && typeof item.name === "string");
}

function createFunctionConfig(fn: AbiFunction): ClearSigningFunctionConfig {
  const fields = (fn.inputs ?? []).flatMap((input, index) => createFields(input, input.name || `arg${index}`));
  if (fn.stateMutability === "payable") {
    fields.push({ path: "@.value", label: "Native value", format: "amount", visible: "always" });
  }

  return {
    include: false,
    reviewed: false,
    intent: "",
    fields,
    test: {
      description: "",
      args: (fn.inputs ?? []).map(createExampleValue),
      ...(fn.stateMutability === "payable" ? { value: "0" } : {}),
    },
  };
}

function createFields(parameter: AbiParameter, fallbackName: string, prefix = ""): DisplayField[] {
  const name = parameter.name || fallbackName;
  const { baseType, arrayDepth } = splitArrayType(parameter.type);
  const path = [prefix, name, ...Array.from({ length: arrayDepth }, () => "[]")].filter(Boolean).join(".");
  const label = humanize(name);

  if (baseType === "tuple") {
    return (parameter.components ?? []).flatMap((component, index) =>
      createFields(component, component.name || `field${index}`, path),
    );
  }

  return [createScalarField(parameter, path, label)];
}

function createScalarField(parameter: AbiParameter, path: string, label: string): DisplayField {
  const { baseType } = splitArrayType(parameter.type);
  return {
    path,
    label,
    format: baseType === "address" ? "addressName" : "raw",
    visible: "always",
  };
}

function createExampleValue(parameter: AbiParameter): unknown {
  const outerArray = parameter.type.match(/^(.*)\[([0-9]*)\]$/);
  if (outerArray) {
    const length = outerArray[2] === "" ? 0 : Number(outerArray[2]);
    const element = { ...parameter, type: outerArray[1] };
    return Array.from({ length }, () => createExampleValue(element));
  }
  const { baseType } = splitArrayType(parameter.type);
  if (baseType === "tuple") {
    return (parameter.components ?? []).map(createExampleValue);
  }
  if (baseType === "address") return "0x0000000000000000000000000000000000000000";
  if (baseType === "bool") return false;
  if (baseType === "string") return "";
  if (baseType === "bytes") return "0x";
  const sizedBytes = baseType.match(/^bytes(\d+)$/);
  if (sizedBytes) return `0x${"00".repeat(Number(sizedBytes[1]))}`;
  if (/^(u?int)(\d+)?$/.test(baseType)) return "0";
  return "0";
}

function buildUnsignedTransaction(
  deployment: ClearSigningDeployment,
  signature: string,
  config: ClearSigningFunctionConfig,
) {
  const abiFunction = getWritableFunctions(deployment.abi).find(fn => formatFunctionSignature(fn) === signature);
  if (!abiFunction) throw new Error(`${signature} is not present in the deployment ABI.`);
  const canonicalSignature = canonicalFunctionSignature(abiFunction);
  const contractInterface = new Interface(deployment.abi as InterfaceAbi);
  let data: string;
  try {
    data = contractInterface.encodeFunctionData(canonicalSignature, config.test.args);
  } catch (error) {
    throw new Error(`${signature}: could not encode test arguments: ${errorMessage(error)}`);
  }
  const value = normalizeValue(config.test.value);
  const transaction = Transaction.from({
    type: 2,
    chainId: deployment.chainId,
    nonce: 0,
    gasLimit: 0,
    maxFeePerGas: 0,
    maxPriorityFeePerGas: 0,
    to: deployment.address,
    value,
    data,
    accessList: [],
  });
  return { rawTx: transaction.unsignedSerialized };
}

async function renderPreview(
  descriptorPath: string,
  descriptor: Erc7730Descriptor,
  transaction: { rawTx: string },
  from: string | undefined,
  dataProvider: DataProvider | undefined,
): Promise<RenderedDisplay> {
  const descriptorDirectory = dirname(descriptorPath);
  const descriptorFile = basename(descriptorPath);
  const deployment = descriptor.context.contract.deployments[0];
  const decodedTransaction = Transaction.from(transaction.rawTx);
  if (!decodedTransaction.to) throw new Error("Generated fixture transaction has no recipient.");
  if (decodedTransaction.chainId == null) throw new Error("Generated fixture transaction has no chain ID.");
  const index = {
    calldataIndex: { [`eip155:${deployment.chainId}:${deployment.address.toLowerCase()}`]: descriptorFile },
    typedDataIndex: {},
  };
  const resolver = createFilesystemResolver({ index, descriptorDirectory });
  const model = await format(
    {
      chainId: Number(decodedTransaction.chainId),
      to: decodedTransaction.to,
      data: decodedTransaction.data,
      value: decodedTransaction.value,
      ...(from ? { from: getAddress(from) } : {}),
    },
    {
      descriptorResolverOptions: { type: "custom", resolver },
      externalDataProvider: buildExternalDataProvider(dataProvider),
    },
  );

  if (model.warnings?.length) {
    throw new Error(formatWarnings(model.warnings));
  }
  const fieldWarnings = collectFieldWarnings(model.fields ?? []);
  if (fieldWarnings.length) throw new Error(formatWarnings(fieldWarnings));
  return mapDisplayModel(model);
}

function mapDisplayModel(model: DisplayModel): RenderedDisplay {
  const rendered: RenderedDisplay = {
    intent:
      typeof model.intent === "string"
        ? model.intent
        : Object.entries(model.intent ?? {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(", "),
    fields: mapFields(model.fields ?? []),
  };
  if (model.interpolatedIntent !== undefined) rendered.interpolatedIntent = model.interpolatedIntent;
  if (model.metadata?.owner !== undefined) rendered.owner = model.metadata.owner;
  return rendered;
}

function mapFields(fields: ReadonlyArray<LibraryDisplayField | DisplayFieldGroup>): RenderedField[] {
  const rendered: RenderedField[] = [];
  for (const field of fields) {
    if (isFieldGroup(field)) {
      rendered.push(...mapFields(field.fields));
    } else if (
      "embeddedCalldata" in field &&
      field.embeddedCalldata?.display &&
      !field.embeddedCalldata.display.warnings?.length
    ) {
      rendered.push({ label: field.label, value: mapDisplayModel(field.embeddedCalldata.display) });
    } else {
      rendered.push({ label: field.label, value: field.value });
    }
  }
  return rendered;
}

function collectFieldWarnings(fields: ReadonlyArray<LibraryDisplayField | DisplayFieldGroup>): Warning[] {
  const warnings: Warning[] = [];
  for (const field of fields) {
    if (field.warning) warnings.push(field.warning);
    if (isFieldGroup(field)) {
      warnings.push(...collectFieldWarnings(field.fields));
    } else if ("embeddedCalldata" in field && field.embeddedCalldata?.display) {
      warnings.push(...(field.embeddedCalldata.display.warnings ?? []));
      warnings.push(...collectFieldWarnings(field.embeddedCalldata.display.fields ?? []));
    }
  }
  return warnings;
}

function formatWarnings(warnings: Warning[]) {
  return [...new Set(warnings.map(warning => `${warning.code}: ${warning.message}`))].join("; ");
}

function buildExternalDataProvider(input: DataProvider | undefined) {
  const tokens = lowercaseKeys(input?.tokens ?? {});
  const addressNames = lowercaseKeys(input?.addressNames ?? {});
  const ensNames = lowercaseKeys(input?.ensNames ?? {});
  const nftNames = lowercaseKeys(input?.nftCollectionNames ?? {});
  const blockTimestamps = input?.blockTimestamps ?? {};

  return {
    resolveToken: async (_chainId: number, address: string) => tokens[address.toLowerCase()] ?? null,
    resolveLocalName: async (address: string, acceptedTypes?: AddressType[]) => {
      const name = addressNames[address.toLowerCase()];
      return name ? { name, typeMatch: !acceptedTypes?.length } : null;
    },
    resolveEnsName: async (address: string, acceptedTypes?: AddressType[]) => {
      const name = ensNames[address.toLowerCase()];
      return name ? { name, typeMatch: !acceptedTypes?.length } : null;
    },
    resolveNftCollectionName: async (_chainId: number, address: string) => {
      const name = nftNames[address.toLowerCase()];
      return name ? { name } : null;
    },
    resolveBlockTimestamp: async (_chainId: number, blockHeight: bigint) => {
      const timestamp = blockTimestamps[blockHeight.toString()];
      return timestamp == null ? null : { timestamp };
    },
    resolveChainInfo: lookupChainInfo,
  };
}

const chainInfoCache = new Map<
  number,
  { name: string; nativeCurrency: { name: string; symbol: string; decimals: number } }
>();

async function lookupChainInfo(chainId: number) {
  const cached = chainInfoCache.get(chainId);
  if (cached) return cached;
  const response = await fetch(
    `https://raw.githubusercontent.com/ethereum-lists/chains/${CHAIN_METADATA_COMMIT}/_data/chains/eip155-${chainId}.json`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (!response.ok) return null;
  const chain = (await response.json()) as {
    name?: string;
    nativeCurrency?: { name: string; symbol: string; decimals: number };
  };
  if (chain.name && chain.nativeCurrency)
    chainInfoCache.set(chainId, { name: chain.name, nativeCurrency: chain.nativeCurrency });
  return chainInfoCache.get(chainId) ?? null;
}

function formatNamedParameter(parameter: AbiParameter, fallbackName: string): string {
  const name = parameter.name || fallbackName;
  const { baseType, arraySuffix } = splitArrayType(parameter.type);
  const type =
    baseType === "tuple"
      ? `(${(parameter.components ?? []).map((component, index) => formatNamedParameter(component, `field${index}`)).join(",")})${arraySuffix}`
      : parameter.type;
  return `${type} ${name}`;
}

function canonicalParameterType(parameter: AbiParameter): string {
  const { baseType, arraySuffix } = splitArrayType(parameter.type);
  if (baseType !== "tuple") return parameter.type;
  return `(${(parameter.components ?? []).map(canonicalParameterType).join(",")})${arraySuffix}`;
}

function splitArrayType(type: string) {
  const arraySuffix = type.match(/(\[[0-9]*\])*$/)?.[0] ?? "";
  const baseType = type.slice(0, type.length - arraySuffix.length);
  const arrayDepth = (arraySuffix.match(/\[/g) ?? []).length;
  return { baseType, arraySuffix, arrayDepth };
}

function normalizeValue(value: string | undefined): bigint {
  if (value == null || value === "") return 0n;
  const normalized = BigInt(value);
  if (normalized < 0n) throw new Error("test.value must be a non-negative wei amount.");
  return normalized;
}

function humanize(value: string) {
  const words = value
    .replace(/^_+/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!words) return "Value";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function functionId(signature: string) {
  const name = signature.slice(0, signature.indexOf("(")).replace(/[^A-Za-z0-9_-]/g, "-");
  const suffix = createHash("sha256").update(signature).digest("hex").slice(0, 8);
  return `${name}-${suffix}`;
}

function assertEntity(entity: unknown) {
  if (typeof entity !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(entity) || entity === "." || entity === "..") {
    throw new Error(
      "entity must be a registry folder name containing only letters, numbers, periods, underscores, and hyphens.",
    );
  }
}

function assertHttpUrl(value: unknown) {
  if (typeof value !== "string") throw new Error("metadata.info.url must be an HTTP(S) URL.");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:")
    throw new Error("metadata.info.url must be an HTTP(S) URL.");
}

function lowercaseKeys<T>(input: Record<string, T>) {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key.toLowerCase(), value]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type AddressType = "wallet" | "eoa" | "contract" | "token" | "collection";

function hasEntries(value: object | undefined) {
  return value != null && Object.values(value).some(entry => entry != null && Object.keys(entry).length > 0);
}

function sha256(value: unknown) {
  return `0x${createHash("sha256")
    .update(`${JSON.stringify(value, null, 2)}\n`)
    .digest("hex")}`;
}

function renderValue(value: string | RenderedDisplay): string {
  return typeof value === "string" ? value : (value.interpolatedIntent ?? value.intent);
}

function formatValidationErrors(errors: string[]) {
  return `Clear-signing configuration is not ready:\n${errors.map(error => `- ${error}`).join("\n")}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function relativeToPackage(packageRoot: string, path: string) {
  return relative(packageRoot, resolve(path));
}
