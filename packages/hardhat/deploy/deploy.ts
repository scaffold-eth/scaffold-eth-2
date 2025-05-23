import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MyToken contract...");

  // Get the contract factory
  const MyToken = await ethers.getContractFactory("MyToken");

  // Calculate initial supply (1,000,000 tokens with 18 decimals)
  const initialSupply = 1000000n * 10n ** 18n;

  // Deploy the contract with the initial supply
  console.log("Starting deployment...");
  const myToken = await MyToken.deploy(initialSupply);

  // Wait for deployment to complete
  await myToken.deploymentTransaction()?.wait();
  
  // Get the deployed contract address
  console.log(`MyToken deployed to: ${await myToken.getAddress()}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
