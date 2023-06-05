import { GenericContractsDeclaration } from "./contract";
import { Transaction, decodeFunctionData } from "viem";
import { hardhat } from "wagmi/chains";
import contractData from "~~/generated/deployedContracts";

// type FunctionArgNameType = string;

const deployedContracts = contractData as GenericContractsDeclaration | null;

export const decodeTransactionData = (tx: Transaction) => {
  if (!deployedContracts?.[hardhat.id]) {
    return;
  }
  if (tx.input.length >= 10) {
    for (const [, { abi }] of Object.entries(deployedContracts?.[hardhat.id]?.[0].contracts)) {
      try {
        const result = decodeFunctionData({ abi, data: tx.input });
        return result;
      } catch {}
    }

    // for (const [, contractInterface] of Object.entries(interfaces)) {
    //   try {
    //     const decodedData = contractInterface.parseTransaction({ data: tx.input });
    //     tx.functionName = `${decodedData.name}`;
    //     tx.functionArgs = Object.values(decodedData.args);
    //     tx.functionArgNames = contractInterface.getFunction(decodedData.name).inputs.map((input: any) => input.name);
    //     tx.functionArgTypes = contractInterface.getFunction(decodedData.name).inputs.map((input: any) => input.type);
    //     break;
    //   } catch (e) {
    //     console.error(`Parsing failed: ${e}`);
    //   }
    // }
  }
  // return tx;
};

export const getFunctionDetails = (transaction: Transaction) => {
  // if (
  //   transaction &&
  //   transaction.functionName &&
  //   transaction.functionArgNames &&
  //   transaction.functionArgTypes &&
  //   transaction.functionArgs
  // ) {
  //   const details = transaction.functionArgNames.map(
  //     (name: FunctionArgNameType, i: number) =>
  //       `${transaction.functionArgTypes?.[i] || ""} ${name} = ${transaction.functionArgs?.[i] || ""}`,
  //   );
  //   return `${transaction.functionName}(${details.join(", ")})`;
  // }
  return "";
};
