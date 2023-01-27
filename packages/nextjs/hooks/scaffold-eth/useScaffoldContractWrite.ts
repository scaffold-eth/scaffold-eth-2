import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { getDeployedContract } from "~~/components/scaffold-eth/Contract/utilsContract";
import { parseTxnValue } from "~~/utils/scaffold-eth";

const useScaffoldContractWrite = (contractName: string, functionName: string, args?: any[], value?: string) => {
  const { chain } = useNetwork();
  const deployedContractData = getDeployedContract(chain?.id.toString(), contractName);
  const { config } = usePrepareContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    args,
    functionName,
    overrides: {
      value: value ? parseTxnValue(value) : undefined,
    },
  });

  return useContractWrite(config);
};

export default useScaffoldContractWrite;
