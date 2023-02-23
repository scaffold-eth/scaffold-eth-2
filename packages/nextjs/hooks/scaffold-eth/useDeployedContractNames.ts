import { useEffect, useState } from "react";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * @dev use this hook to get the list of contracts deployed by `yarn deploy`.
 * @returns {string[]} array of contract names
 */
export const useDeployedContractNames = () => {
  const configuredChain = getTargetNetwork();
  const [deployedContractNames, setDeployedContractNames] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const contracts = require("~~/generated/hardhat_contracts.json");
    const contractsAtChain = contracts[`${configuredChain.id}` as keyof typeof contracts];
    const contractsData = contractsAtChain?.[0]?.contracts;
    const contractNames = contractsData ? Object.keys(contractsData) : [];

    setDeployedContractNames(contractNames);
  }, [configuredChain.id]);

  return deployedContractNames;
};
