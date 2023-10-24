import hre from "hardhat";
import { generateDeployments } from "../utils";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 */
const deployYourContract = async function () {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const [deployerClient] = await hre.viem.getWalletClients();

  // @ts-expect-error: artifacts is not defined
  const yourContract = await hre.viem.deployContract("YourContract", [deployer], {
    walletClient: deployerClient,
  });

  const chainId = await deployerClient.getChainId();
  // @ts-expect-error: artifacts is not defined
  const yourContractArtifact = artifacts.readArtifactSync("YourContract");

  await generateDeployments({
    address: yourContract.address,
    contractData: yourContractArtifact,
    chainId,
  });

  // Get the deployed contract
  // const yourContract = await hre.viem.getContractAt("YourContract", yourContract.address);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
