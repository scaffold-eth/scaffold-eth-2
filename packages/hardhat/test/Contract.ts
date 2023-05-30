import { ethers } from "hardhat";
import { Contract } from "../typechain-types";

describe("Contract", function () {
  // We define a fixture to reuse the same setup in every test.

  let contract: Contract;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("Contract");
    contract = (await contractFactory.deploy(owner.address)) as Contract;
    await contract.deployed();
  });

  // Tests here
});
