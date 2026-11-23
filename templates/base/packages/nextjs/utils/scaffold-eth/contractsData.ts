import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { GenericContractsDeclaration, contracts } from "~~/utils/scaffold-eth/contract";

const DEFAULT_ALL_CONTRACTS: GenericContractsDeclaration[number] = {};

export function useAllContracts() {
  const { targetNetwork } = useTargetNetwork();
  const contractsData = contracts?.[targetNetwork.id];
  // using constant to avoid creating a new object on every call
  return contractsData || DEFAULT_ALL_CONTRACTS;
}
