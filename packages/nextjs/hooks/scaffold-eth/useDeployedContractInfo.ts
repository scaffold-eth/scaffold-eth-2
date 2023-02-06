import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { toast } from "~~/utils/scaffold-eth";

type GeneratedContractType = {
  address: string;
  abi: any[];
};

/**
 * use this hook to get deployed contract from generated files of `yarn deploy`
 * @param chainId - deployed contract chainId
 * @param contractName - name of deployed contract
 * @returns {GeneratedContractType | undefined} object containing contract address and abi or undefined if contract is not found
 */
export const useDeployedContractInfo = ({
  chainId,
  contractName,
}: {
  chainId: string | undefined;
  contractName: string | undefined | null;
}) => {
  const [deployedContractData, setDeployedContractData] = useState<undefined | GeneratedContractType>(undefined);
  const provider = useProvider();

  useEffect(() => {
    (async () => {
      let ContractData;
      try {
        ContractData = require("~~/generated/hardhat_contracts.json");
        const contractsAtChain = ContractData[chainId as keyof typeof ContractData];
        const contractsData = contractsAtChain?.[0]?.contracts;

        // Looking at blockchain to see whats stored at `deployedContractData.address`, if its `0x0` then high possibility that its not a contract
        const code = await provider.getCode(contractsData.address);
        if (code === "0x") {
          setDeployedContractData(undefined);
          throw new Error();
          return;
        }
        setDeployedContractData(contractsData?.[contractName as keyof typeof contractsData]);
      } catch (e) {
        toast.error("Target contract not found, did your forgot `yarn deploy` ?");
        return;
      }
    })();
  }, [chainId, contractName, provider]);

  return deployedContractData;
};
