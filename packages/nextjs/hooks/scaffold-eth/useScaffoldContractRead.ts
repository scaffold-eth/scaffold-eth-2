import { useContractRead, useNetwork } from "wagmi";
import type { Abi } from "abitype";
import { getDeployedContract } from "~~/components/scaffold-eth/Contract/utilsContract";

const useScaffoldContractRead = (
  contractName: string,
  functionName: string,
  readConfig?: Parameters<typeof useContractRead>[0],
) => {
  const { chain } = useNetwork();
  const deployedContractData = getDeployedContract(chain?.id.toString(), contractName);

  return useContractRead({
    ...readConfig,
    functionName,
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
  });
};

export default useScaffoldContractRead;
