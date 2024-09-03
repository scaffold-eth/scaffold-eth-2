import { Contract } from 'viem';

export class MintingBurning {
  private tokenContract: Contract;

  constructor(tokenContract: Contract) {
    this.tokenContract = tokenContract;
  }

  async mint(to: string, amount: number): Promise<void> {
    await this.tokenContract.write.mint([to, amount]);
  }

  async burn(from: string, amount: number): Promise<void> {
    await this.tokenContract.write.burn([from, amount]);
  }
}