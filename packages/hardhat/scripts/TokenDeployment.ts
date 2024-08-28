import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";

export class TokenDeployment {
  private factory: ContractFactory;

  constructor(contractName: string) {
    this.factory = ethers.getContractFactory(contractName);
  }

  async deployToken(initialSupply: number): Promise<Contract> {
    const contract = await this.factory.deploy(initialSupply);
    await contract.deployed();
    return contract;
  }
}
