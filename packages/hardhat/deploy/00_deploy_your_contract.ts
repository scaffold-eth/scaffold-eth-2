import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";
import { getChainId } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { utils, Wallet } from "zksync-web3";

const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const chainId = await getChainId();
  console.log("Running deploy script for YourContract...");
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  if (chainId === "280") {
    console.log("Deploying to zkSync-testnet (chainId 280)");
    // deploy to zkSync-testnet
    /// Initialize the wallet
    const wallet = new Wallet(deployerPrivateKey);

    /// Create deployer object and load the artifact of the contract you want to deploy
    const deployer = new Deployer(hre, wallet);
    const YourContractArtifact = await deployer.loadArtifact("YourContract");

    /// Estimate the gas for the contract deployment
    const deploymentFee = await deployer.estimateDeployFee(YourContractArtifact, [wallet.address]);

    // OPTIONAL: Deposit funds to L2
    // Comment this block if you already have funds on zkSync.
    const depositHandle = await deployer.zkWallet.deposit({
      to: deployer.zkWallet.address,
      token: utils.ETH_ADDRESS,
      amount: deploymentFee.mul(2),
    });
    // Wait until the deposit is processed on zkSync
    await depositHandle.wait();

    /// Deploy the contract
    const parsedFee = ethers.utils.parseEther(deploymentFee.toString());
    console.log("Deploying YourContract with fee", parsedFee.toString());

    const YourContract = await deployer.deploy(YourContractArtifact, [wallet.address]);

    /// Print the address of the deployed contract
    console.log("YourContract deployed to:", {
      address: YourContract.address,
      args: YourContract.interface.encodeDeploy([wallet.address]),
    });
  } else {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    await deploy("YourContract", {
      from: deployer,
      // Contract constructor arguments
      args: [deployer],
      log: true,
      // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
      // automatically mining the contract deployment transaction. There is no effect on live networks.
      autoMine: true,
    });

    // Get the deployed contract
    // const yourContract = await hre.ethers.getContract("YourContract", deployer);
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
