import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ZeroHash } from "ethers";
import { ethers } from "hardhat";
import { TimelockController, TimelockedAdminTarget } from "../typechain-types";

describe("TimelockModule", function () {
  const minDelay = 3600n;
  const initialFeeBps = 250n;
  const zeroValue = 0n;
  const localTimelockArtifact = "contracts/TimelockController.sol:TimelockController";

  let timelock: TimelockController;
  let target: TimelockedAdminTarget;

  beforeEach(async function () {
    const [deployer, proposer, executor] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory("TimelockedAdminTarget");
    target = (await targetFactory.deploy(
      deployer.address,
      deployer.address,
      initialFeeBps,
      false,
    )) as TimelockedAdminTarget;
    await target.waitForDeployment();

    const timelockFactory = await ethers.getContractFactory(localTimelockArtifact);
    timelock = (await timelockFactory.deploy(
      minDelay,
      [proposer.address],
      [executor.address],
      deployer.address,
    )) as TimelockController;
    await timelock.waitForDeployment();

    await target.transferOwnership(await timelock.getAddress());
    await timelock.renounceRole(await timelock.DEFAULT_ADMIN_ROLE(), deployer.address);
  });

  const buildOperation = async (
    operationSalt: string,
    fn: "setTreasury" | "setFeeBps" | "setFeatureEnabled",
    args: readonly unknown[],
  ) => {
    const targetAddress = await target.getAddress();
    const data = target.interface.encodeFunctionData(fn, args);
    const id = await timelock.hashOperation(targetAddress, zeroValue, data, ZeroHash, operationSalt);

    return { id, data, targetAddress };
  };

  it("allows a proposer to schedule a valid operation", async function () {
    const [, proposer, , treasury] = await ethers.getSigners();
    const salt = ethers.id("schedule-treasury");
    const operation = await buildOperation(salt, "setTreasury", [treasury.address]);

    await expect(
      timelock.connect(proposer).schedule(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt, minDelay),
    ).to.emit(timelock, "CallScheduled");

    expect(await timelock.getOperationState(operation.id)).to.equal(1n);
  });

  it("rejects scheduling from an account without proposer role", async function () {
    const [, , , outsider] = await ethers.getSigners();
    const salt = ethers.id("unauthorized-schedule");
    const operation = await buildOperation(salt, "setFeeBps", [300n]);

    await expect(
      timelock.connect(outsider).schedule(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt, minDelay),
    )
      .to.be.revertedWithCustomError(timelock, "AccessControlUnauthorizedAccount")
      .withArgs(outsider.address, await timelock.PROPOSER_ROLE());
  });

  it("rejects direct admin calls after ownership is transferred to the timelock", async function () {
    const [deployer] = await ethers.getSigners();

    await expect(target.connect(deployer).setFeeBps(350n))
      .to.be.revertedWithCustomError(target, "OwnableUnauthorizedAccount")
      .withArgs(deployer.address);
  });

  it("enforces the timelock delay before execution", async function () {
    const [, proposer, executor, treasury] = await ethers.getSigners();
    const salt = ethers.id("delay-enforcement");
    const operation = await buildOperation(salt, "setTreasury", [treasury.address]);

    await timelock
      .connect(proposer)
      .schedule(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt, minDelay);

    await expect(
      timelock.connect(executor).execute(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt),
    ).to.be.revertedWithCustomError(timelock, "TimelockUnexpectedOperationState");
  });

  it("allows an executor to run a ready operation after the delay", async function () {
    const [, proposer, executor, treasury] = await ethers.getSigners();
    const salt = ethers.id("execute-ready");
    const operation = await buildOperation(salt, "setTreasury", [treasury.address]);

    await timelock
      .connect(proposer)
      .schedule(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt, minDelay);
    await time.increase(minDelay);

    await expect(
      timelock.connect(executor).execute(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt),
    ).to.emit(target, "TreasuryUpdated");

    expect(await target.treasury()).to.equal(treasury.address);
    expect(await timelock.getOperationState(operation.id)).to.equal(3n);
  });

  it("allows a canceller to cancel a pending operation", async function () {
    const [, proposer, , treasury] = await ethers.getSigners();
    const salt = ethers.id("cancel-pending");
    const operation = await buildOperation(salt, "setTreasury", [treasury.address]);

    await timelock
      .connect(proposer)
      .schedule(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt, minDelay);

    await expect(timelock.connect(proposer).cancel(operation.id)).to.emit(timelock, "Cancelled").withArgs(operation.id);
    expect(await timelock.getOperationState(operation.id)).to.equal(0n);
  });

  it("does not allow execution of a cancelled operation", async function () {
    const [, proposer, executor, treasury] = await ethers.getSigners();
    const salt = ethers.id("cancelled-execution");
    const operation = await buildOperation(salt, "setTreasury", [treasury.address]);

    await timelock
      .connect(proposer)
      .schedule(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt, minDelay);
    await timelock.connect(proposer).cancel(operation.id);
    await time.increase(minDelay);

    await expect(
      timelock.connect(executor).execute(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt),
    ).to.be.revertedWithCustomError(timelock, "TimelockUnexpectedOperationState");
  });

  it("rejects execution from an account without executor role", async function () {
    const [, proposer, , outsider, treasury] = await ethers.getSigners();
    const salt = ethers.id("unauthorized-execute");
    const operation = await buildOperation(salt, "setTreasury", [treasury.address]);

    await timelock
      .connect(proposer)
      .schedule(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt, minDelay);
    await time.increase(minDelay);

    await expect(timelock.connect(outsider).execute(operation.targetAddress, zeroValue, operation.data, ZeroHash, salt))
      .to.be.revertedWithCustomError(timelock, "AccessControlUnauthorizedAccount")
      .withArgs(outsider.address, await timelock.EXECUTOR_ROLE());
  });
});
