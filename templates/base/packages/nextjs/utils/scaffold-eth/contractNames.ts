import scaffoldConfig from "~~/scaffold.config";
import { ContractName, contracts } from "~~/utils/scaffold-eth/contract";

export function getContractNames() {
  const contractsData = contracts?.[scaffoldConfig.targetNetwork.id];
  return contractsData ? (Object.keys(contractsData) as ContractName[]) : [];
}
