import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const MIN_DELAY_SECONDS = 3600;
const INITIAL_FEE_BPS = 250;
const INITIAL_FEATURE_ENABLED = false;
const LOCAL_TIMELOCK_ARTIFACT = "contracts/TimelockController.sol:TimelockController";

const waitForTransaction = async (txPromise: Promise<any>) => {
  const tx = await txPromise;
  await tx.wait();
};

const deployTimelockModule: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const targetDeployment = await deploy("TimelockedAdminTarget", {
    from: deployer,
    args: [deployer, deployer, INITIAL_FEE_BPS, INITIAL_FEATURE_ENABLED],
    log: true,
    autoMine: true,
  });

  const timelockDeployment = await deploy("TimelockController", {
    contract: LOCAL_TIMELOCK_ARTIFACT,
    from: deployer,
    args: [MIN_DELAY_SECONDS, [deployer], [deployer], deployer],
    log: true,
    autoMine: true,
  });

  const targetContract = await hre.ethers.getContractAt("TimelockedAdminTarget", targetDeployment.address);
  const timelockContract = await hre.ethers.getContractAt(LOCAL_TIMELOCK_ARTIFACT, timelockDeployment.address);
  const deployerSigner = await hre.ethers.getSigner(deployer);

  if ((await targetContract.owner()) !== timelockDeployment.address) {
    await waitForTransaction(
      targetContract.connect(deployerSigner).transferOwnership(timelockDeployment.address, { gasLimit: 100_000n }),
    );
  }

  const defaultAdminRole = await timelockContract.DEFAULT_ADMIN_ROLE();
  if (await timelockContract.hasRole(defaultAdminRole, deployer)) {
    await waitForTransaction(
      timelockContract.connect(deployerSigner).renounceRole(defaultAdminRole, deployer, { gasLimit: 120_000n }),
    );
  }

  log(`Timelock delay: ${MIN_DELAY_SECONDS} seconds`);
  log(`Timelocked target owner: ${await targetContract.owner()}`);
  log(`Timelock address: ${timelockDeployment.address}`);
  log(`Target address: ${targetDeployment.address}`);
  log(`Initial treasury: ${await targetContract.treasury()}`);
  log(`Initial feeBps: ${(await targetContract.feeBps()).toString()}`);
  log(`Initial featureEnabled: ${await targetContract.featureEnabled()}`);
  log(`Proposer / Executor / Canceller: ${deployer}`);
  log(`Bootstrap admin renounced: ${!(await timelockContract.hasRole(defaultAdminRole, deployer))}`);
};

export default deployTimelockModule;

deployTimelockModule.tags = ["TimelockModule"];
