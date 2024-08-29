import { Contract } from "ethers";

export class CarbonCreditManagement {
  private contract: Contract;

  constructor(contract: Contract) {
    this.contract = contract;
  }

  async issueCredits(to: string, amount: number): Promise<void> {
    await this.contract.issueCredits(to, amount);
  }

  async retireCredits(from: string, amount: number): Promise<boolean> {
    return await this.contract.retireCredits(from, amount);
  }
}
