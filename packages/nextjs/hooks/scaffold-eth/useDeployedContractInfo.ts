import { useEffect, useState } from "react";
import { useIsMounted } from "usehooks-ts";
import { useProvider } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import contracts from "../../generated/hardhat_contracts";
import { Contract, ContractName, ContractCodeStatus, DefaultChain } from "./contract.types";

/**
 * @dev use this hook to get a deployed contract from `yarn deploy` generated files.
 * @param contractName - name of deployed contract
 * @returns {GeneratedContractType | undefined} object containing contract address and abi or undefined if contract is not found
 */
export const useDeployedContractInfo = <TContractName extends ContractName>(contractName: TContractName) => {
  const isMounted = useIsMounted();
  const configuredChain = getTargetNetwork();
  const deployedContract = contracts[`${configuredChain.id}` as DefaultChain]?.[0]?.contracts?.[
    contractName as ContractName
  ] as Contract<TContractName>;
  const [status, setStatus] = useState<ContractCodeStatus>(ContractCodeStatus.LOADING);
  const provider = useProvider({ chainId: configuredChain.id });

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
  }, [isMounted, configuredChain.id, contractName, deployedContract, provider]);

  return {
    data: status === ContractCodeStatus.DEPLOYED ? deployedContract : undefined,
    isLoading: status === ContractCodeStatus.LOADING,
  };
};
