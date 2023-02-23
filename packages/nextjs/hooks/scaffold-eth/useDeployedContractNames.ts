import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

import contracts from "~~/generated/hardhat_contracts.json";

/**
 * @dev use this hook to get the list of contracts deployed by `yarn deploy`.
 * @returns {string[]} array of contract names
 */
export const useDeployedContractNames = () => {
  const configuredChain = getTargetNetwork();
  const [deployedContractNames, setDeployedContractNames] = useState<string[]>(
    Object.keys(contracts[`${configuredChain.id}` as keyof typeof contracts]?.[0]?.contracts ?? {}),
  );
  const provider = useProvider({ chainId: configuredChain.id });

  useEffect(() => {
    if (provider) {
      try {
        const contractsAtChain = contracts[`${configuredChain.id}` as keyof typeof contracts];
        const contractsData = contractsAtChain?.[0]?.contracts;
        setDeployedContractNames(contractsData ? Object.keys(contractsData) : []);
      } catch (e) {
        // Contract not deployed or file doesn't exist.
        setDeployedContractNames([]);
        return;
      }
    }
  }, [configuredChain.id, provider]);

  return deployedContractNames;
};
