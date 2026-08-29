import { createHash } from "node:crypto";
import { id } from "ethers";
import { canonicalFunctionSignature, getAbiFunctions } from "./core.js";
import type { AbiFunction, AbiItem, AbiParameter, ClearSigningDeployment, SourcifyEvidence } from "./types.js";

type SourcifyContract = {
  abi?: AbiItem[];
  match?: string;
  proxyResolution?: {
    isProxy?: boolean;
    proxyType?: string;
    implementations?: Array<{ address?: string; name?: string }>;
  };
};

export async function checkSourcify(deployment: ClearSigningDeployment): Promise<SourcifyEvidence> {
  const url = `https://sourcify.dev/server/v2/contract/${deployment.chainId}/${deployment.address}?fields=abi,proxyResolution`;
  const response = await fetch(url, {
    headers: { "User-Agent": "scaffold-eth-2-clear-signing" },
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 404) {
    throw new Error(
      `${deployment.address} on chain ${deployment.chainId} is not verified on Sourcify. Run yarn verify --network ${deployment.network} sourcify first.`,
    );
  }
  if (!response.ok) throw new Error(`Sourcify request failed with HTTP ${response.status}: ${url}`);

  const contract = (await response.json()) as SourcifyContract;
  if (!Array.isArray(contract.abi)) {
    throw new Error(`Sourcify returned no verified ABI for ${deployment.address} on chain ${deployment.chainId}.`);
  }
  if (contract.match !== "match") {
    throw new Error(
      `Sourcify did not return a full match for ${deployment.address} on chain ${deployment.chainId} (received ${contract.match ?? "no match status"}).`,
    );
  }
  if (contract.proxyResolution?.isProxy !== false) {
    const implementations = (contract.proxyResolution?.implementations ?? [])
      .map(implementation => implementation.address)
      .filter(Boolean)
      .join(", ");
    const proxyDescription =
      contract.proxyResolution?.isProxy === true
        ? (contract.proxyResolution.proxyType ?? "unknown proxy")
        : "unknown proxy status";
    throw new Error(
      `Proxy deployments are outside the first Clear Signing MVP (${proxyDescription}${
        implementations ? `; implementation ${implementations}` : ""
      }). Author the ERC-7730 v2 proxy constraints manually.`,
    );
  }

  assertNoSelectorCollisions(deployment.abi, "deployment");
  assertNoSelectorCollisions(contract.abi, "Sourcify");

  const localFunctions = normalizedFunctionMap(deployment.abi);
  const verifiedFunctions = normalizedFunctionMap(contract.abi);
  const missingFromVerified = [...localFunctions.keys()].filter(signature => !verifiedFunctions.has(signature));
  const missingFromLocal = [...verifiedFunctions.keys()].filter(signature => !localFunctions.has(signature));
  const different = [...localFunctions.keys()].filter(
    signature =>
      verifiedFunctions.has(signature) &&
      JSON.stringify(localFunctions.get(signature)) !== JSON.stringify(verifiedFunctions.get(signature)),
  );
  if (missingFromVerified.length || missingFromLocal.length || different.length) {
    throw new Error(
      [
        "The deployment function ABI does not exactly match the Sourcify function ABI.",
        ...missingFromVerified.map(signature => `Missing from Sourcify: ${signature}`),
        ...missingFromLocal.map(signature => `Missing from deployment: ${signature}`),
        ...different.map(signature => `Different function definition: ${signature}`),
      ].join("\n"),
    );
  }

  const normalizedFunctions = [...verifiedFunctions.values()];
  return {
    checkedAt: new Date().toISOString(),
    url,
    match: "match",
    proxy: false,
    abiComparison: "exact-function-abi",
    functionAbiSha256: sha256(normalizedFunctions),
  };
}

function normalizedFunctionMap(abi: AbiItem[]) {
  const entries = getAbiFunctions(abi).map(fn => {
    const signature = canonicalFunctionSignature(fn);
    return [signature, normalizeFunction(fn)] as const;
  });
  const functions = new Map(entries);
  if (functions.size !== entries.length) throw new Error("The ABI contains duplicate function definitions.");
  return new Map([...functions.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function normalizeFunction(fn: AbiFunction) {
  return {
    type: "function" as const,
    name: fn.name,
    stateMutability: normalizeStateMutability(fn),
    inputs: (fn.inputs ?? []).map(normalizeParameter),
    outputs: (fn.outputs ?? []).map(normalizeParameter),
  };
}

function normalizeParameter(parameter: AbiParameter): Record<string, unknown> {
  return {
    name: parameter.name ?? "",
    type: parameter.type,
    ...(parameter.components ? { components: parameter.components.map(normalizeParameter) } : {}),
  };
}

function normalizeStateMutability(fn: AbiFunction) {
  if (fn.stateMutability) return fn.stateMutability;
  const legacy = fn as AbiFunction & { constant?: boolean; payable?: boolean };
  if (legacy.constant) return "view";
  if (legacy.payable) return "payable";
  return "nonpayable";
}

function assertNoSelectorCollisions(abi: AbiItem[], source: string) {
  const selectors = new Map<string, string[]>();
  for (const fn of getAbiFunctions(abi)) {
    const signature = canonicalFunctionSignature(fn);
    const selector = id(signature).slice(0, 10);
    selectors.set(selector, [...(selectors.get(selector) ?? []), signature]);
  }
  for (const [selector, signatures] of selectors) {
    if (new Set(signatures).size > 1) {
      throw new Error(`The ${source} ABI has a selector collision at ${selector}: ${signatures.join(", ")}.`);
    }
  }
}

function sha256(value: unknown) {
  return `0x${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}
