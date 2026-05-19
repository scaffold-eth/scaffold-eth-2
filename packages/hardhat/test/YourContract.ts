import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  async function deployYourContractFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    const yourContract = (await yourContractFactory.deploy(owner.address)) as YourContract;
    await yourContract.waitForDeployment();
    return { yourContract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should have the right owner", async function () {
      const { yourContract, owner } = await loadFixture(deployYourContractFixture);
      expect(await yourContract.owner()).to.equal(owner.address);
    });

    it("Should have the default greeting", async function () {
      const { yourContract } = await loadFixture(deployYourContractFixture);
      expect(await yourContract.greeting()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should have premium set to false", async function () {
      const { yourContract } = await loadFixture(deployYourContractFixture);
      expect(await yourContract.premium()).to.equal(false);
    });

    it("Should have totalCounter at zero", async function () {
      const { yourContract } = await loadFixture(deployYourContractFixture);
      expect(await yourContract.totalCounter()).to.equal(0);
    });
  });

  describe("setGreeting", function () {
    it("Should allow setting a new message", async function () {
      const { yourContract } = await loadFixture(deployYourContractFixture);
      const newGreeting = "Learn Scaffold-ETH 2! :)";
      await yourContract.setGreeting(newGreeting);
      expect(await yourContract.greeting()).to.equal(newGreeting);
    });

    it("Should increment totalCounter", async function () {
      const { yourContract } = await loadFixture(deployYourContractFixture);
      await yourContract.setGreeting("First");
      expect(await yourContract.totalCounter()).to.equal(1);
      await yourContract.setGreeting("Second");
      expect(await yourContract.totalCounter()).to.equal(2);
    });

    it("Should track user greeting count", async function () {
      const { yourContract, owner, otherAccount } = await loadFixture(deployYourContractFixture);
      await yourContract.setGreeting("Owner message");
      expect(await yourContract.userGreetingCounter(owner.address)).to.equal(1);

      await yourContract.connect(otherAccount).setGreeting("Other message");
      expect(await yourContract.userGreetingCounter(otherAccount.address)).to.equal(1);
      expect(await yourContract.userGreetingCounter(owner.address)).to.equal(1);
    });

    it("Should set premium to true when ETH is sent", async function () {
      const { yourContract } = await loadFixture(deployYourContractFixture);
      await yourContract.setGreeting("Premium message", { value: ethers.parseEther("0.01") });
      expect(await yourContract.premium()).to.equal(true);
    });

    it("Should set premium to false when no ETH is sent", async function () {
      const { yourContract } = await loadFixture(deployYourContractFixture);
      // First send with ETH
      await yourContract.setGreeting("Premium message", { value: ethers.parseEther("0.01") });
      expect(await yourContract.premium()).to.equal(true);
      // Then send without ETH
      await yourContract.setGreeting("Free message");
      expect(await yourContract.premium()).to.equal(false);
    });

    it("Should emit GreetingChange event", async function () {
      const { yourContract, owner } = await loadFixture(deployYourContractFixture);
      const newGreeting = "Event test";
      await expect(yourContract.setGreeting(newGreeting))
        .to.emit(yourContract, "GreetingChange")
        .withArgs(owner.address, newGreeting, false, 0);
    });

    it("Should emit GreetingChange event with premium when ETH sent", async function () {
      const { yourContract, owner } = await loadFixture(deployYourContractFixture);
      const newGreeting = "Premium event test";
      const value = ethers.parseEther("0.01");
      await expect(yourContract.setGreeting(newGreeting, { value }))
        .to.emit(yourContract, "GreetingChange")
        .withArgs(owner.address, newGreeting, true, value);
    });
  });

  describe("withdraw", function () {
    it("Should allow owner to withdraw", async function () {
      const { yourContract, owner } = await loadFixture(deployYourContractFixture);
      // Send ETH to contract
      await yourContract.setGreeting("Fund me", { value: ethers.parseEther("1") });
      const contractBalance = await ethers.provider.getBalance(yourContract.target);
      expect(contractBalance).to.equal(ethers.parseEther("1"));

      // Withdraw
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await yourContract.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const contractBalanceAfter = await ethers.provider.getBalance(yourContract.target);
      expect(contractBalanceAfter).to.equal(0);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + ethers.parseEther("1n") - gasUsed);
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      const { yourContract, otherAccount } = await loadFixture(deployYourContractFixture);
      await yourContract.setGreeting("Fund me", { value: ethers.parseEther("1") });
      await expect(yourContract.connect(otherAccount).withdraw()).to.be.revertedWith("Not the Owner");
    });
  });

  describe("receive", function () {
    it("Should accept ETH via receive", async function () {
      const { yourContract, owner } = await loadFixture(deployYourContractFixture);
      await owner.sendTransaction({ to: yourContract.target, value: ethers.parseEther("0.5") });
      const balance = await ethers.provider.getBalance(yourContract.target);
      expect(balance).to.equal(ethers.parseEther("0.5"));
    });
  });
});
