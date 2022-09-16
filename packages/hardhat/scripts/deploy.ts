import { ethers } from 'hardhat';

async function main() {
  const YourContract = await ethers.getContractFactory("YourContract");
  const yourContract = await YourContract.deploy();

  await yourContract.deployed();

  console.log(`YourContract is now deployed to ${yourContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
