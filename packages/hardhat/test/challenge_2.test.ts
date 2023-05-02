import { expect } from "chai";
import { ethers } from "hardhat";
// @ALLAN fix this import
import { YourContract } from "../typechain-types";

describe("YourToken", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourToken: YourContract;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourTokenFactory = await ethers.getContractFactory("YourToken");
    yourToken = (await yourTokenFactory.deploy(owner.address)) as YourContract;
    await yourToken.deployed();
  });
  // @ALLAN add these tests
  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await yourToken.greeting()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Scaffold-ETH 2! :)";

      await yourToken.setGreeting(newGreeting);
      expect(await yourToken.greeting()).to.equal(newGreeting);
    });
  });
});
