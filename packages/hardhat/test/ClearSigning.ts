import { expect } from "chai";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createConfig,
  formatFunctionSignature,
  generateArtifacts,
  validateConfig,
  writeJson,
} from "../scripts/clear-signing/core.js";
import { loadRockethDeployment } from "../scripts/clear-signing/rocketh.js";
import { checkSourcify } from "../scripts/clear-signing/sourcify.js";
import type { AbiFunction, ClearSigningConfig, ClearSigningDeployment } from "../scripts/clear-signing/types.js";

const address = "0x1111111111111111111111111111111111111111";
const writeFunction: AbiFunction = {
  type: "function",
  name: "setValue",
  inputs: [{ name: "value", type: "uint256" }],
  outputs: [],
  stateMutability: "nonpayable",
};
const readFunction: AbiFunction = {
  type: "function",
  name: "value",
  inputs: [],
  outputs: [{ name: "", type: "uint256" }],
  stateMutability: "view",
};

describe("Clear Signing workflow", function () {
  let temporaryRoot: string;
  const originalFetch = globalThis.fetch;

  beforeEach(async function () {
    temporaryRoot = await mkdtemp(join(tmpdir(), "se2-clear-signing-"));
  });

  afterEach(async function () {
    globalThis.fetch = originalFetch;
    await rm(temporaryRoot, { recursive: true, force: true });
  });

  it("loads chain and contract metadata from a Rocketh deployment", async function () {
    const deploymentDirectory = join(temporaryRoot, "deployments", "sepolia");
    await mkdir(deploymentDirectory, { recursive: true });
    await writeFile(join(deploymentDirectory, ".chain"), JSON.stringify({ chainId: "11155111" }));
    await writeFile(
      join(deploymentDirectory, "Example.json"),
      JSON.stringify({
        address,
        abi: [writeFunction],
        transactionHash: `0x${"22".repeat(32)}`,
        receipt: { blockNumber: "0x2a" },
      }),
    );

    const deployment = await loadRockethDeployment(temporaryRoot, "sepolia", "Example");

    expect(deployment.chainId).to.equal(11155111);
    expect(deployment.address).to.equal(address);
    expect(deployment.transactionHash).to.equal(`0x${"22".repeat(32)}`);
    expect(deployment.blockNumber).to.equal(42);
  });

  it("scaffolds only signable functions and requires an explicit review", function () {
    const payableTuple: AbiFunction = {
      type: "function",
      name: "submit",
      inputs: [
        {
          name: "orders",
          type: "tuple[]",
          components: [
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
          ],
        },
      ],
      outputs: [],
      stateMutability: "payable",
    };
    const deployment = makeDeployment([payableTuple, readFunction]);

    const config = createConfig(deployment, {
      entity: "example",
      owner: "Example",
      url: "https://example.com",
    });
    const signature = formatFunctionSignature(payableTuple);

    expect(Object.keys(config.functions)).to.deep.equal(["submit((address token,uint256 amount)[] orders)"]);
    expect(config.functions[signature].include).to.equal(false);
    expect(config.functions[signature].reviewed).to.equal(false);
    expect(config.functions[signature].fields.map(field => field.path)).to.deep.include.members([
      "orders.[].token",
      "orders.[].amount",
    ]);
    expect(config.functions[signature].fields.at(-1)).to.deep.include({ path: "@.value", format: "amount" });
    expect(validateConfig(config, deployment)).to.include("Select at least one function by setting include to true.");

    config.functions[signature].include = true;
    config.functions[signature].intent = "Submit orders";
    config.functions[signature].test.description = "Submit one order";
    expect(validateConfig(config, deployment)).to.include(
      `${signature}: set reviewed to true after checking its semantics and preview.`,
    );
    expect(validateConfig(config, deployment, { requireReviewed: false })).not.to.include(
      `${signature}: set reviewed to true after checking its semantics and preview.`,
    );
  });

  it("renders a reviewed function and creates registry v2 fixtures", async function () {
    const deployment = makeDeployment([writeFunction, readFunction]);
    const config = createConfig(deployment, {
      entity: "example",
      owner: "Example",
      url: "https://example.com",
    });
    const signature = formatFunctionSignature(writeFunction);
    config.functions[signature] = {
      ...config.functions[signature],
      include: true,
      reviewed: true,
      intent: "Set value",
      test: { description: "Set value to 42", args: ["42"] },
    };

    const artifacts = await generateArtifacts(temporaryRoot, config, deployment);

    expect(artifacts.descriptor.$schema).to.equal("../../specs/erc7730-v2.schema.json");
    expect(artifacts.descriptor.context.contract.deployments).to.deep.equal([{ chainId: 1, address }]);
    expect(artifacts.fixtures.descriptor).to.equal("../calldata-Example.json");
    expect(artifacts.fixtures.tests).to.have.length(1);
    expect(artifacts.fixtures.tests[0].rawTx).to.match(/^0x02/);
    expect(artifacts.fixtures.tests[0].expected).to.deep.equal({
      intent: "Set value",
      owner: "Example",
      fields: [{ label: "Value", value: "42" }],
    });

    const writtenFixture = JSON.parse(await readFile(artifacts.fixturePath, "utf8"));
    expect(writtenFixture).to.deep.equal(artifacts.fixtures);
  });

  it("creates encodable defaults for fixed arrays and flattens nested tuple fields", async function () {
    const complexFunction: AbiFunction = {
      type: "function",
      name: "submit",
      inputs: [
        { name: "values", type: "uint256[2]" },
        {
          name: "order",
          type: "tuple",
          components: [
            {
              name: "details",
              type: "tuple",
              components: [
                { name: "recipient", type: "address" },
                { name: "limits", type: "uint256[2]" },
              ],
            },
          ],
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    };
    const deployment = makeDeployment([complexFunction]);
    const config = createConfig(deployment, {
      entity: "example",
      owner: "Example",
      url: "https://example.com",
    });
    const signature = formatFunctionSignature(complexFunction);

    expect(config.functions[signature].test.args).to.deep.equal([
      ["0", "0"],
      [["0x0000000000000000000000000000000000000000", ["0", "0"]]],
    ]);
    expect(config.functions[signature].fields).to.deep.include.members([
      {
        path: "order.details.recipient",
        label: "Recipient",
        format: "addressName",
        visible: "always",
      },
      { path: "order.details.limits.[]", label: "Limits", format: "raw", visible: "always" },
    ]);
    expect(config.functions[signature].fields.some(field => field.fields)).to.equal(false);

    config.functions[signature] = {
      ...config.functions[signature],
      include: true,
      reviewed: true,
      intent: "Submit order",
      test: {
        description: "Submit fixed values",
        args: [["1", "2"], [[address, ["3", "4"]]]],
      },
    };
    config.dataProvider = { addressNames: { [address]: "Test recipient" } };
    const artifacts = await generateArtifacts(temporaryRoot, config, deployment);
    expect(artifacts.fixtures.tests[0].rawTx).to.match(/^0x02/);
    expect(artifacts.previews[0].rendered.fields.map(field => field.label)).to.deep.equal([
      "Values",
      "Values",
      "Recipient",
      "Limits",
      "Limits",
    ]);
  });

  it("returns controlled validation errors for malformed configs", function () {
    const deployment = makeDeployment([writeFunction]);
    const signature = formatFunctionSignature(writeFunction);
    const malformed = {
      version: 1,
      network: deployment.network,
      contract: deployment.contractName,
      metadata: { owner: 7, contractName: "Example", info: {} },
      functions: { [signature]: null },
    } as unknown as ClearSigningConfig;

    expect(() => validateConfig(malformed, deployment)).not.to.throw();
    const errors = validateConfig(malformed, deployment);
    expect(errors).to.include(
      "entity must be a registry folder name containing only letters, numbers, periods, underscores, and hyphens.",
    );
    expect(errors).to.include("metadata.info.url must be an HTTP(S) URL.");
    expect(errors).to.include("metadata.owner must not be empty.");
    expect(errors).to.include(`${signature}: function config must be an object.`);
  });

  it("writes generated JSON atomically without following a target symlink", async function () {
    const protectedPath = join(temporaryRoot, "protected.json");
    const outputPath = join(temporaryRoot, "output.json");
    await writeFile(protectedPath, "protected\n");
    await symlink(protectedPath, outputPath);

    await writeJson(outputPath, { generated: true });

    expect(await readFile(protectedPath, "utf8")).to.equal("protected\n");
    expect(JSON.parse(await readFile(outputPath, "utf8"))).to.deep.equal({ generated: true });
  });

  it("rejects duplicate fixture descriptions and impossible nonpayable values", function () {
    const secondFunction: AbiFunction = { ...writeFunction, name: "setOther" };
    const deployment = makeDeployment([writeFunction, secondFunction]);
    const config = createConfig(deployment, {
      entity: "example",
      owner: "Example",
      url: "https://example.com",
    });
    for (const fn of [writeFunction, secondFunction]) {
      const signature = formatFunctionSignature(fn);
      config.functions[signature] = {
        ...config.functions[signature],
        include: true,
        reviewed: true,
        intent: "Set value",
        test: { description: "Duplicate description", args: ["1"], value: "1" },
      };
    }

    const errors = validateConfig(config, deployment);
    expect(errors.filter(error => error.includes("nonpayable functions cannot"))).to.have.length(2);
    expect(errors).to.include(
      'test.description must be unique; "Duplicate description" is used by setValue(uint256 value), setOther(uint256 value).',
    );
  });

  it("rejects field-level formatter warnings", async function () {
    const addressFunction: AbiFunction = {
      type: "function",
      name: "approve",
      inputs: [{ name: "spender", type: "address" }],
      outputs: [],
      stateMutability: "nonpayable",
    };
    const deployment = makeDeployment([addressFunction]);
    const config = createConfig(deployment, {
      entity: "example",
      owner: "Example",
      url: "https://example.com",
    });
    const signature = formatFunctionSignature(addressFunction);
    config.functions[signature] = {
      ...config.functions[signature],
      include: true,
      reviewed: true,
      intent: "Approve spender",
      test: { description: "Approve an unknown spender", args: [address] },
    };

    const error = await caughtError(generateArtifacts(temporaryRoot, config, deployment));
    expect(error.message).to.include("UNKNOWN_ADDRESS");

    config.dataProvider = { addressNames: { [address]: "Known spender" } };
    config.functions[signature].fields[0].params = { types: ["eoa"] };
    const typeError = await caughtError(generateArtifacts(temporaryRoot, config, deployment));
    expect(typeError.message).to.include("ADDRESS_TYPE_MISMATCH");
  });

  it("requires exact function ABI equality from a full, non-proxy Sourcify match", async function () {
    const deployment = makeDeployment([writeFunction]);
    mockSourcify({ match: "match", abi: [writeFunction], proxyResolution: { isProxy: false } });

    const evidence = await checkSourcify(deployment);
    expect(evidence).to.deep.include({
      match: "match",
      proxy: false,
      abiComparison: "exact-function-abi",
    });
    expect(evidence.functionAbiSha256).to.match(/^0x[0-9a-f]{64}$/);

    mockSourcify({
      match: "match",
      abi: [{ ...writeFunction, inputs: [{ name: "renamed", type: "uint256" }] }],
      proxyResolution: { isProxy: false },
    });
    const mismatch = await caughtError(checkSourcify(deployment));
    expect(mismatch.message).to.include("Different function definition: setValue(uint256)");
  });

  it("fails closed on partial matches, unknown proxy status, and selector collisions", async function () {
    const deployment = makeDeployment([writeFunction]);
    mockSourcify({ match: "partial", abi: [writeFunction], proxyResolution: { isProxy: false } });
    expect((await caughtError(checkSourcify(deployment))).message).to.include("did not return a full match");

    mockSourcify({ match: "match", abi: [writeFunction] });
    expect((await caughtError(checkSourcify(deployment))).message).to.include("unknown proxy status");

    const firstCollision: AbiFunction = {
      type: "function",
      name: "f8491",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    };
    const secondCollision: AbiFunction = { ...firstCollision, name: "f130736" };
    const collidingDeployment = makeDeployment([firstCollision, secondCollision]);
    mockSourcify({
      match: "match",
      abi: [firstCollision, secondCollision],
      proxyResolution: { isProxy: false },
    });
    expect((await caughtError(checkSourcify(collidingDeployment))).message).to.include("selector collision");
  });
});

function mockSourcify(body: unknown) {
  globalThis.fetch = async () => new Response(JSON.stringify(body), { status: 200 });
}

async function caughtError(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    if (error instanceof Error) return error;
    throw error;
  }
  throw new Error("Expected promise to reject.");
}

function makeDeployment(abi: AbiFunction[]): ClearSigningDeployment {
  return {
    network: "mainnet",
    contractName: "Example",
    chainId: 1,
    address,
    abi,
    deploymentFile: "/deployments/mainnet/Example.json",
  };
}
