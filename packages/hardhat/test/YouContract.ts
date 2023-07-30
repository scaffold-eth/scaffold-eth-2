import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { YourContract } from "../typechain-types";
import { Deployment } from "hardhat-deploy/types";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;
  before(async () => {
    // Since we already have deployment scripts available, there's no need to write them again
    await deployments.fixture(["all"]);
    const deployment: Deployment = await deployments.get("YourContract");
    yourContract = await ethers.getContractAt(deployment.abi, deployment.address);
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await yourContract.greeting()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Scaffold-ETH 2! :)";

      await yourContract.setGreeting(newGreeting);
      expect(await yourContract.greeting()).to.equal(newGreeting);
    });
  });
});
