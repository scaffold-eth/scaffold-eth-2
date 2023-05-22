import { ethers } from "ethers";
import deployedContracts from "~~/generated/deployedContracts";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";

const chain = deployedContracts[31337][0];
const interfaces: { [contractName: string]: ethers.utils.Interface } = {};

for (const [contractName, contract] of Object.entries(chain.contracts)) {
  interfaces[contractName] = new ethers.utils.Interface(contract.abi);
}

export const decodeTransactionData = (tx: TransactionWithFunction): TransactionWithFunction => {
  if (tx.data.length >= 10) {
    for (const [, contractInterface] of Object.entries(interfaces)) {
      try {
        const decodedData = contractInterface.parseTransaction({ data: tx.data });
        tx.functionName = `${decodedData.name}`;
        break;
      } catch (e) {
        console.error(`Parsing failed: ${e}`);
      }
    }
  }
  return tx;
};
