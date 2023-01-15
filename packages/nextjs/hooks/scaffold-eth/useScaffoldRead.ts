import { useContractRead, useNetwork } from "wagmi";
import { getDeployedContract } from "~~/components/scaffold-eth/Contract/utilsContract";

const useScaffoldRead = (
  contractName: string,
  functionName: string,
  readConfig?: Omit<Parameters<typeof useContractRead>[0], "functionName">,
) => {
  const { chain } = useNetwork();
  const deployedContractData = getDeployedContract(chain?.id.toString(), contractName);
  let contractAddress = "";
  let contractABI = [];
  if (deployedContractData) {
    ({ address: contractAddress, abi: contractABI } = deployedContractData);
  }

  return useContractRead({
    ...readConfig,
    functionName,
    addressOrName: contractAddress,
    contractInterface: contractABI,
  });
};

export default useScaffoldRead;
