const func = async function (hre: any) {
  console.log("Deploying MyToken contract...");
  
  const { ethers } = hre;
  
  // Get accounts
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  
  console.log(`Deploying with account: ${deployer.address}`);

  // Calculate initial supply (1,000,000 tokens with 18 decimals)
  const initialSupply = ethers.parseEther("1000000");

  // Get the contract factory
  const MyToken = await ethers.getContractFactory("MyToken");

  // Deploy the contract
  console.log("Starting deployment...");
  const myToken = await MyToken.deploy(initialSupply);
  await myToken.waitForDeployment();
  
  const tokenAddress = await myToken.getAddress();
  
  console.log(`MyToken deployed to: ${tokenAddress}`);
  console.log(`Deployed by: ${deployer.address}`);
  
  // Store the deployed contract address for generateTsAbis to pick up
  (global as any).deployedContracts = {
    MyToken: tokenAddress
  };
  
  return true;
};

export default func;
func.tags = ["MyToken"];
func.id = "deploy_mytoken";
