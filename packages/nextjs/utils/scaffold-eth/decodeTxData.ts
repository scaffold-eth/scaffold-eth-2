import { GenericContractsDeclaration } from "./contract";
import { JsonFragment } from "@ethersproject/abi";
import { ethers } from "ethers";
import { Transaction } from "viem";
import { hardhat } from "wagmi/chains";
import contractData from "~~/generated/deployedContracts";

type ContractsInterfaces = Record<string, ethers.utils.Interface>;
type FunctionArgNameType = string;
type IndexType = number;

const deployedContracts = contractData as GenericContractsDeclaration | null;
const chainMetaData = deployedContracts?.[hardhat.id]?.[0];
const interfaces = chainMetaData
  ? Object.entries(chainMetaData.contracts).reduce((finalInterfacesObj, [contractName, contract]) => {
      finalInterfacesObj[contractName] = new ethers.utils.Interface(contract.abi as JsonFragment[]);
      return finalInterfacesObj;
    }, {} as ContractsInterfaces)
  : {};

export const decodeTransactionData = (tx: Transaction) => {
  if (tx.input.length >= 10) {
    for (const [, contractInterface] of Object.entries(interfaces)) {
      try {
        const decodedData = contractInterface.parseTransaction({ data: tx.input });
        tx.functionName = `${decodedData.name}`;
        tx.functionArgs = Object.values(decodedData.args);
        tx.functionArgNames = contractInterface.getFunction(decodedData.name).inputs.map((input: any) => input.name);
        tx.functionArgTypes = contractInterface.getFunction(decodedData.name).inputs.map((input: any) => input.type);
        break;
      } catch (e) {
        console.error(`Parsing failed: ${e}`);
      }
    }
  }
  return tx;
};

export const getFunctionDetails = (transaction: Transaction) => {
  if (
    transaction &&
    transaction.functionName &&
    transaction.functionArgNames &&
    transaction.functionArgTypes &&
    transaction.functionArgs
  ) {
    const details = transaction.functionArgNames.map(
      (name: FunctionArgNameType, i: IndexType) =>
        `${transaction.functionArgTypes?.[i] || ""} ${name} = ${transaction.functionArgs?.[i] || ""}`,
    );
    return `${transaction.functionName}(${details.join(", ")})`;
  }
  return "";
};
