import { GenericContractsDeclaration } from "./contract";
import { JsonFragment } from "@ethersproject/abi";
import { ethers } from "ethers";
import { hardhat } from "wagmi/chains";
import deployedContracts from "~~/contracts/deployedContracts";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";

let deployedLocalhostContracts: GenericContractsDeclaration | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  deployedLocalhostContracts = require("~~/contracts/deployedLocalhostContracts")["default"];
} catch (e) {}

let contractsData: GenericContractsDeclaration | null = null;
if (deployedContracts && deployedLocalhostContracts) {
  contractsData = {
    ...(deployedContracts as GenericContractsDeclaration),
    ...(deployedLocalhostContracts as GenericContractsDeclaration),
  };
} else if (deployedContracts) {
  contractsData = deployedContracts;
} else if (deployedLocalhostContracts) {
  contractsData = deployedLocalhostContracts;
}

type ContractsInterfaces = Record<string, ethers.utils.Interface>;
type FunctionArgNameType = string;
type IndexType = number;
type TransactionType = TransactionWithFunction | null;

const chainMetaData = contractsData?.[hardhat.id]?.[0];
const interfaces = chainMetaData
  ? Object.entries(chainMetaData.contracts).reduce((finalInterfacesObj, [contractName, contract]) => {
      finalInterfacesObj[contractName] = new ethers.utils.Interface(contract.abi as JsonFragment[]);
      return finalInterfacesObj;
    }, {} as ContractsInterfaces)
  : {};

export const decodeTransactionData = (tx: TransactionWithFunction) => {
  if (tx.data.length >= 10) {
    for (const [, contractInterface] of Object.entries(interfaces)) {
      try {
        const decodedData = contractInterface.parseTransaction({ data: tx.data });
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

export const getFunctionDetails = (transaction: TransactionType) => {
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
