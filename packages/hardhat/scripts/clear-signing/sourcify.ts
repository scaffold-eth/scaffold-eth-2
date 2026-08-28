import { id } from "ethers";
import { canonicalFunctionSignature, getAbiFunctions } from "./core.js";
import type { AbiItem, ClearSigningDeployment, SourcifyEvidence } from "./types.js";

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
  const response = await fetch(url, { headers: { "User-Agent": "scaffold-eth-2-clear-signing" } });
  if (response.status === 404) {
    throw new Error(
      `${deployment.address} on chain ${deployment.chainId} is not verified on Sourcify. Run yarn verify --network ${deployment.network} sourcify first.`,
    );
  }
  if (!response.ok) throw new Error(`Sourcify request failed with HTTP ${response.status}: ${url}`);

  const contract = (await response.json()) as SourcifyContract;
  if (!contract.match || !Array.isArray(contract.abi)) {
    throw new Error(`Sourcify returned no verified ABI for ${deployment.address} on chain ${deployment.chainId}.`);
  }
  if (contract.proxyResolution?.isProxy) {
    const implementations = (contract.proxyResolution.implementations ?? [])
      .map(implementation => implementation.address)
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `Proxy deployments are outside the first Clear Signing MVP (${contract.proxyResolution.proxyType ?? "unknown proxy"}${
        implementations ? `; implementation ${implementations}` : ""
      }). Author the ERC-7730 v2 proxy constraints manually.`,
    );
  }

  const localSelectors = functionSelectorMap(deployment.abi);
  const verifiedSelectors = functionSelectorMap(contract.abi);
  const missingFromVerified = [...localSelectors.keys()].filter(selector => !verifiedSelectors.has(selector));
  const missingFromLocal = [...verifiedSelectors.keys()].filter(selector => !localSelectors.has(selector));
  if (missingFromVerified.length || missingFromLocal.length) {
    throw new Error(
      [
        "The deployment ABI does not match the Sourcify ABI.",
        ...missingFromVerified.map(selector => `Missing from Sourcify: ${localSelectors.get(selector)} (${selector})`),
        ...missingFromLocal.map(
          selector => `Missing from deployment: ${verifiedSelectors.get(selector)} (${selector})`,
        ),
      ].join("\n"),
    );
  }

  return {
    checkedAt: new Date().toISOString(),
    url,
    match: contract.match,
    abiCompatible: true,
  };
}

function functionSelectorMap(abi: AbiItem[]) {
  return new Map(
    getAbiFunctions(abi).map(fn => {
      const signature = canonicalFunctionSignature(fn);
      return [id(signature).slice(0, 10), signature];
    }),
  );
}
