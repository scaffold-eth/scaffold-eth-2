import hre from "hardhat";
import MyToken from "../ignition/modules/MyToken.js";
import generateTsAbis from "./generateTsAbis.ts";

async function main () {
  const { mytoken } = await hre.ignition.deploy(MyToken);

  console.log(`MyToken deployed to: ${await mytoken.getAddress()}`);
  console.log('Writing abi to nextjs directory...');
  await generateTsAbis(hre, myToken);
  console.log('Done!');
}

main().catch(console.error);
