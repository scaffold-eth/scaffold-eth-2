import { ethers, hardhatArguments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import generateTsAbis from "../scripts/generateTsAbis";

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
  const tokenAddress = await myToken.getAddress();
  console.log(`MyToken deployed to: ${tokenAddress}`);
  
  // Return the deployed contract addresses
  return {
    MyToken: tokenAddress
  };
}

// Function to run the ABI generation after deployment
async function runAll() {
  // First run the main deployment
  const deployedContracts = await main();
  
  // Then generate the TypeScript ABIs
  console.log("Generating TypeScript ABI definitions...");
  const hre = require('hardhat') as HardhatRuntimeEnvironment;
  await generateTsAbis(hre, deployedContracts);
  console.log("TypeScript ABI generation complete!");
}

// Execute the deployment and ABI generation
runAll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
