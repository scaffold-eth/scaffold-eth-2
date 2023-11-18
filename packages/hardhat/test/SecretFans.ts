import { expect } from "chai";
import { ethers } from "hardhat";
import { SecretFans } from "../typechain-types";
import type { Signer } from "ethers";

describe("SecretFans", function () {
  // We define a fixture to reuse the same setup in every test.

  let secretFans: SecretFans;
  let contentCreator: Signer, participant1: Signer, participant2: Signer;
  const publicKey1 = "0x2BAb50935100E3cC34d3a8c4D370Db770CD72398";
  const privateKey1 = "9e241c6f05e08ce348ec94347bf91816eeec45de4eb3bd54526da902fffb9afa";
  const publicKey2 = "0xC497FCB667e24eEe83E9A50c1cAF56BB2845857f";
  const privateKey2 = "310e2789b97e3f003939e14d78961f467765480715551c9add3bfb542a085f94";
  const enrollmentAmount = ethers.utils.parseEther("1");


  before(async () => {
    [contentCreator, participant1, participant2] = await ethers.getSigners();
    const SecretFansFactory = await ethers.getContractFactory("SecretFans");
    secretFans = (await SecretFansFactory.deploy(contentCreator.getAddress())) as SecretFans;
    await secretFans.deployed();
  });

  describe("SecretFans", function () {
    it("Should allow subscibtion", async function () {
      await secretFans.subscribeSpotsAvaliable(contentCreator.getAddress(), publicKey1, { value: enrollmentAmount })
      await secretFans.subscribeSpotsAvaliable(contentCreator.getAddress(), publicKey2, { value: enrollmentAmount })
      expect().to.equal(
        "Building Unstoppable Apps!!!",
      );
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Scaffold-ETH 2! :)";

      await secretFans.setGreeting(newGreeting);
      expect(await secretFans.greeting()).to.equal(newGreeting);
    });
  });
});
