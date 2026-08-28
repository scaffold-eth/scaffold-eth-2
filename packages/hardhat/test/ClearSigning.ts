import { expect } from "chai";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createConfig,
  formatFunctionSignature,
  generateArtifacts,
  validateConfig,
} from "../scripts/clear-signing/core.js";
import { loadRockethDeployment } from "../scripts/clear-signing/rocketh.js";
import type { AbiFunction, ClearSigningDeployment } from "../scripts/clear-signing/types.js";

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

  beforeEach(async function () {
    temporaryRoot = await mkdtemp(join(tmpdir(), "se2-clear-signing-"));
  });

  afterEach(async function () {
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
    expect(config.functions[signature].fields[0]).to.deep.include({ path: "orders.[]", iteration: "sequential" });
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
});

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
