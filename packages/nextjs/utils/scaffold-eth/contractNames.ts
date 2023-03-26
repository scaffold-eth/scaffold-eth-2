import { ContractName, GenericContractsDeclaration } from "~~/hooks/scaffold-eth/contract.types";
import scaffoldConfig from "~~/scaffold.config";

export function getContractNames() {
  if (!scaffoldConfig.contracts) {
    return [];
  }
  const contractsData = (scaffoldConfig.contracts as GenericContractsDeclaration)[scaffoldConfig.targetNetwork.id]?.[0]
    ?.contracts;
  return contractsData ? (Object.keys(contractsData) as ContractName[]) : [];
}
