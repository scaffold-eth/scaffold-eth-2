import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

type GeneratedContractType = {
  address: string;
  abi: any[];
};

/**
 * @dev use this hook to get a deployed contract from `yarn deploy` generated files.
 * @param contractName - name of deployed contract
 * @returns {GeneratedContractType | undefined} object containing contract address and abi or undefined if contract is not found
 */
export const useDeployedContractInfo = (contractName: string | undefined | null) => {
  const [deployedContractData, setDeployedContractData] = useState<undefined | GeneratedContractType>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const configuredNetwork = scaffoldConfig.targetNetwork;

  const provider = useProvider({ chainId: configuredNetwork.id });

  useEffect(() => {
    const getDeployedContractInfo = async () => {
      setIsLoading(true);
      let ContractData;
      try {
        ContractData = require("~~/generated/hardhat_contracts.json");
        const contractsAtChain = ContractData[configuredNetwork.id as keyof typeof ContractData];
        const contractsData = contractsAtChain?.[0]?.contracts;
        const deployedContract = contractsData?.[contractName as keyof typeof contractsData];

        if (!deployedContract || !contractName || !provider) {
          return;
        }

        const code = await provider.getCode(deployedContract.address);
        // If contract code is `0x` => no contract deployed on that address
        if (code === "0x" || !contractsData || !(contractName in contractsData)) {
          return;
        }
        setDeployedContractData(contractsData[contractName]);
      } catch (e) {
        // Contract not deployed or file doesn't exist.
        setDeployedContractData(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    getDeployedContractInfo();
  }, [configuredNetwork.id, contractName, provider]);

  return { data: deployedContractData, isLoading };
};
