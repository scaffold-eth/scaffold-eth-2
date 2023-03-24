import { useEffect, useState } from "react";
import { Contract, ContractCodeStatus, ContractName, contracts } from "../../utils/scaffold-eth/contract";
import { useIsMounted } from "usehooks-ts";
import { useProvider } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

/**
 * Gets a deployed contract from `yarn deploy` generated files.
 * @param contractName - name of deployed contract
 */
export const useDeployedContractInfo = <TContractName extends ContractName>(contractName: TContractName) => {
  const isMounted = useIsMounted();
  const deployedContract = contracts?.[scaffoldConfig.targetNetwork.id]?.[0]?.contracts?.[
    contractName as ContractName
  ] as Contract<TContractName>;
  const [status, setStatus] = useState<ContractCodeStatus>(ContractCodeStatus.LOADING);
  const provider = useProvider({ chainId: scaffoldConfig.targetNetwork.id });

  useEffect(() => {
    const checkContractDeployment = async () => {
      if (!deployedContract) {
        setStatus(ContractCodeStatus.NOT_FOUND);
        return;
      }
      const code = await provider.getCode((deployedContract as Contract<TContractName>).address);

      if (!isMounted()) {
        return;
      }
      // If contract code is `0x` => no contract deployed on that address
      if (code === "0x") {
        setStatus(ContractCodeStatus.NOT_FOUND);
        return;
      }
      setStatus(ContractCodeStatus.DEPLOYED);
    };

    checkContractDeployment();
  }, [isMounted, contractName, deployedContract, provider]);

  return {
    data: status === ContractCodeStatus.DEPLOYED ? deployedContract : undefined,
    isLoading: status === ContractCodeStatus.LOADING,
  };
};
