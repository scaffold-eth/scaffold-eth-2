import { useMemo } from "react";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { ContractName, DefaultChain } from "./contract.types";
import contracts from "../../generated/hardhat_contracts";

/**
 * @dev use this hook to get the list of contracts deployed by `yarn deploy`.
 * @returns {string[]} array of contract names
 */
export const useDeployedContractNames = () => {
  const configuredChain = getTargetNetwork();
  const deployedContractNames = useMemo(() => {
    const contractsData = contracts[`${configuredChain.id}` as DefaultChain]?.[0]?.contracts;
    return contractsData ? (Object.keys(contractsData) as ContractName[]) : [];
  }, [configuredChain.id]);

  return deployedContractNames;
};
