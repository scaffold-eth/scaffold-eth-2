import { useEffect, useState } from "react";
import scaffoldConfig from "~~/scaffold.config";

/**
 * @dev use this hook to get the list of contracts deployed by `yarn deploy`.
 * @returns {string[]} array of contract names
 */
export const useDeployedContractNames = () => {
  const [deployedContractNames, setDeployedContractNames] = useState<string[]>([]);

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const contracts = require("~~/generated/hardhat_contracts.json");
      const contractsAtChain = contracts[`${scaffoldConfig.targetNetwork.id}` as keyof typeof contracts];
      const contractsData = contractsAtChain?.[0]?.contracts;
      const contractNames = contractsData ? Object.keys(contractsData) : [];

      setDeployedContractNames(contractNames);
    } catch (e) {
      // File doesn't exist.
      setDeployedContractNames([]);
    }
  }, []);

  return deployedContractNames;
};
