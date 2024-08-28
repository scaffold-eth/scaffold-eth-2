import { Contract } from "ethers";

export class MintingBurning {
  private tokenContract: Contract;

  constructor(tokenContract: Contract) {
    this.tokenContract = tokenContract;
  }

  async mint(to: string, amount: number): Promise<void> {
    await this.tokenContract.mint(to, amount);
  }

  async burn(from: string, amount: number): Promise<void> {
    await this.tokenContract.burn(from, amount);
  }
}
