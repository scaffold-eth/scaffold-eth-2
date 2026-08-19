import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_YourContract } from "../generated/abis/YourContract.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

// We define a fixture to reuse the same setup in every test.
async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });
  const { address, abi } = env.get<Abi_YourContract>("YourContract");
  const yourContract = await ethers.getContractAt(abi, address);
  return { env, yourContract };
}

describe("YourContract", function () {
  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      expect(await yourContract.greeting()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should allow setting a new message", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const newGreeting = "Learn Scaffold-ETH 2! :)";

      const [sender] = await ethers.getSigners();
      await expect(yourContract.setGreeting(newGreeting))
        .to.emit(yourContract, "GreetingChange")
        .withArgs(sender.address, newGreeting, false, 0);
      expect(await yourContract.greeting()).to.equal(newGreeting);
      expect(await yourContract.totalCounter()).to.equal(1);
    });
  });

  describe("setGreeting", function () {
    it("tracks greetings per user and marks paid greetings as premium", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const [sender] = await ethers.getSigners();
      const value = ethers.parseEther("0.01");

      await expect(yourContract.setGreeting("Paid greeting", { value }))
        .to.emit(yourContract, "GreetingChange")
        .withArgs(sender.address, "Paid greeting", true, value);

      expect(await yourContract.premium()).to.equal(true);
      expect(await yourContract.totalCounter()).to.equal(1);
      expect(await yourContract.userGreetingCounter(sender.address)).to.equal(1);
    });

    it("resets premium for a free greeting", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const value = ethers.parseEther("0.01");

      await yourContract.setGreeting("Paid greeting", { value });
      await yourContract.setGreeting("Free greeting");

      expect(await yourContract.premium()).to.equal(false);
      expect(await yourContract.totalCounter()).to.equal(2);
    });
  });

  describe("withdraw", function () {
    it("allows the owner to withdraw the contract balance", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const [owner] = await ethers.getSigners();
      const contractAddress = await yourContract.getAddress();

      await owner.sendTransaction({
        to: contractAddress,
        value: ethers.parseEther("0.01"),
      });
      expect(await ethers.provider.getBalance(contractAddress)).to.equal(ethers.parseEther("0.01"));

      await yourContract.withdraw();
      expect(await ethers.provider.getBalance(contractAddress)).to.equal(0);
    });

    it("rejects withdrawals from non-owners", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const [, nonOwner] = await ethers.getSigners();

      const connectedContract = yourContract.connect(nonOwner as any) as any;
      await expect(connectedContract.withdraw()).to.be.revertedWith("Not the Owner");
    });
  });

  describe("receive", function () {
    it("accepts direct ETH transfers", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const [sender] = await ethers.getSigners();
      const contractAddress = await yourContract.getAddress();
      const value = ethers.parseEther("0.01");

      await sender.sendTransaction({ to: contractAddress, value });

      expect(await ethers.provider.getBalance(contractAddress)).to.equal(value);
    });
  });
});
