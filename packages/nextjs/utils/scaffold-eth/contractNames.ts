import contracts from "../../generated/hardhat_contracts";
import { ContractName } from "~~/hooks/scaffold-eth/contract.types";
import scaffoldConfig from "~~/scaffold.config";

export function getContractNames() {
  const contractsData = contracts[scaffoldConfig.targetNetwork.id]?.[0]?.contracts;
  return contractsData ? (Object.keys(contractsData) as ContractName[]) : [];
}
