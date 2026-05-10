import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

// Testing for implemnetation of Scaffold Hooks (contract address override). This also tests that
// the default behavior still works without overrides

describe("Scaffold Hook - contractAddress override", function () {
  let contractA: YourContract;
  let contractB: YourContract;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");

    contractA = (await yourContractFactory.deploy(owner.address)) as YourContract;
    await contractA.waitForDeployment();
    contractB = (await yourContractFactory.deploy(owner.address)) as YourContract;
    await contractB.waitForDeployment();
  });

  describe("Default behavior", function () {
    it("Should deploy to two different addresses", async function () {
      const addressA = await contractA.getAddress();
      const addressB = await contractB.getAddress();
      expect(addressA).to.not.equal(addressB);
    });

    it("Should read the default greeting from contractA", async function () {
      expect(await contractA.greeting()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should read the default greeting from contractB", async function () {
      expect(await contractB.greeting()).to.equal("Building Unstoppable Apps!!!");
    });
  });

  describe("Address override behavior", function () {
    it("Should set different greetings on each contract independently", async function () {
      await contractA.setGreeting("Hello from Contract A");
      await contractB.setGreeting("Hello from Contract B");

      expect(await contractA.greeting()).to.equal("Hello from Contract A");
      expect(await contractB.greeting()).to.equal("Hello from Contract B");
    });

    it("Should confirm reading by address reaches the correct contract", async function () {
      const addressB = await contractB.getAddress();
      const contractAtAddressB = await ethers.getContractAt("YourContract", addressB);

      expect(await contractAtAddressB.greeting()).to.equal("Hello from Contract B");
    });

    it("Should confirm default address and override address return different data", async function () {
      const addressA = await contractA.getAddress();
      const addressB = await contractB.getAddress();

      const contractAtA = await ethers.getContractAt("YourContract", addressA);
      const contractAtB = await ethers.getContractAt("YourContract", addressB);

      const greetingA = await contractAtA.greeting();
      const greetingB = await contractAtB.greeting();

      expect(greetingA).to.not.equal(greetingB);
      expect(greetingA).to.equal("Hello from Contract A");
      expect(greetingB).to.equal("Hello from Contract B");
    });
  });

  describe("Backward compatibility", function () {
    it("Should still work correctly when no address override is used", async function () {
      const newGreeting = "No override needed here";
      await contractA.setGreeting(newGreeting);
      expect(await contractA.greeting()).to.equal(newGreeting);
    });

    it("Should use contractA address when no override is provided", async function () {
      const addressA = await contractA.getAddress();

      const contractDefault = await ethers.getContractAt("YourContract", addressA);
      const greeting = await contractDefault.greeting();
      expect(greeting).to.equal("No override needed here");
    });
  });
});
