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

      await yourContract.setGreeting(newGreeting);
      expect(await yourContract.greeting()).to.equal(newGreeting);
    });
  });

  describe("Withdraw", function () {
    it("Should allow the owner to withdraw contract balance", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseEther("1");

      await yourContract.setGreeting("Premium greeting", { value: amount });

      const contractAddress = await yourContract.getAddress();
      expect(await ethers.provider.getBalance(contractAddress)).to.equal(amount);

      await yourContract.withdraw();

      expect(await ethers.provider.getBalance(contractAddress)).to.equal(0n);
    });

    it("Should not allow non-owners to withdraw contract balance", async function () {
      const { yourContract } = await networkHelpers.loadFixture(deployFixture);
      const [, nonOwner] = await ethers.getSigners();

      const nonOwnerContract = yourContract.connect(
        nonOwner as unknown as Parameters<typeof yourContract.connect>[0],
      ) as typeof yourContract;

      await expect(nonOwnerContract.withdraw()).to.be.revertedWith("Not the Owner");
    });
  });
});
