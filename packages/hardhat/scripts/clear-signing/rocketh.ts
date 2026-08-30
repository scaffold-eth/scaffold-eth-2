import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { getAddress } from "ethers";
import type { AbiItem, ClearSigningDeployment } from "./types.js";

type RockethDeployment = {
  address?: string;
  abi?: AbiItem[];
  transactionHash?: string;
  deployedBytecode?: string;
  metadata?: string;
  contractName?: string;
  sourceName?: string;
  receipt?: {
    transactionHash?: string;
    blockNumber?: number | string;
  };
};

export async function loadRockethDeployment(
  packageRoot: string,
  network: string,
  contractName: string,
): Promise<ClearSigningDeployment> {
  assertPathSegment(network, "network");
  assertPathSegment(contractName, "contract");

  const networkDirectory = resolve(packageRoot, "deployments", network);
  const deploymentFile = join(networkDirectory, `${contractName}.json`);
  const chainId = await readChainId(networkDirectory);
  const deployment = await readJson<RockethDeployment>(deploymentFile, `deployment for ${contractName}`);

  if (!deployment.address) throw new Error(`Deployment ${deploymentFile} does not contain an address.`);
  if (!Array.isArray(deployment.abi)) throw new Error(`Deployment ${deploymentFile} does not contain an ABI.`);

  return {
    network,
    contractName,
    chainId,
    address: getAddress(deployment.address),
    abi: deployment.abi,
    deploymentFile,
    transactionHash: deployment.transactionHash ?? deployment.receipt?.transactionHash,
    blockNumber: normalizeBlockNumber(deployment.receipt?.blockNumber),
    deployedBytecode: deployment.deployedBytecode,
    compilerMetadata: deployment.metadata,
    sourceName: deployment.sourceName ?? deployment.contractName,
  };
}

async function readChainId(networkDirectory: string): Promise<number> {
  try {
    const chain = await readJson<{ chainId?: number | string }>(join(networkDirectory, ".chain"), "chain metadata");
    if (chain.chainId == null) throw new Error("missing chainId");
    return normalizeChainId(chain.chainId);
  } catch (error) {
    if (!isMissingFile(error)) throw error;
  }

  try {
    return normalizeChainId((await readFile(join(networkDirectory, ".chainId"), "utf8")).trim());
  } catch (error) {
    if (isMissingFile(error)) {
      throw new Error(`No .chain or .chainId file was found in ${networkDirectory}. Run yarn deploy first.`);
    }
    throw error;
  }
}

function normalizeChainId(value: number | string): number {
  const chainId = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error(`Invalid chainId: ${value}`);
  return chainId;
}

function normalizeBlockNumber(value: number | string | undefined): number | undefined {
  if (value == null) return undefined;
  const blockNumber = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(blockNumber) && blockNumber >= 0 ? blockNumber : undefined;
}

async function readJson<T>(path: string, description: string): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch (error) {
    if (isMissingFile(error)) throw error;
    throw new Error(
      `Could not read ${description} at ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function assertPathSegment(value: string, label: string) {
  if (!/^[A-Za-z0-9._-]+$/.test(value) || value === "." || value === "..") {
    throw new Error(`Invalid ${label} name: ${value}`);
  }
}
