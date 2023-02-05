import { utils } from "ethers";
import { useContractWrite, useNetwork, usePrepareContractWrite, useProvider } from "wagmi";
import { getDeployedContract, getParsedEthersError } from "~~/components/scaffold-eth/Contract/utilsContract";
import { toast } from "~~/utils/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { NoContractAddressError } from "~~/components/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractWrite hook(with config prepared by usePrepareContractWrite hook) which loads in deployed contract abi and address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param args - arguments for the function
 * @param value - value in ETH that will be sent with transaction
 */
export const useScaffoldContractWrite = (contractName: string, functionName: string, args?: any[], value?: string) => {
  const { chain } = useNetwork();
  const deployedContractData = getDeployedContract(chain?.id.toString(), contractName);
  const writeTx = useTransactor();
  const provider = useProvider();

  const { config } = usePrepareContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    args,
    functionName,
    overrides: {
      value: value ? utils.parseEther(value) : undefined,
    },
  });

  const wagmiContractWrite = useContractWrite(config);

  const sendContractWriteTx = async () => {
    if (!deployedContractData) {
      toast.error("Target Contract is not defined");
      return;
    }

    // Looking at blockchain to see whats stored at `deployedContractData.address`, if its `0x0` then high possibility that its not a contract
    const code = await provider.getCode(deployedContractData.address);
    if (code === "0x") {
      toast.error(<NoContractAddressError address={deployedContractData.address} />);
      return;
    }

    if (wagmiContractWrite.writeAsync && writeTx) {
      try {
        await writeTx(wagmiContractWrite.writeAsync());
      } catch (e: any) {
        const message = getParsedEthersError(e);
        toast.error(message);
      }
    } else {
      toast.error("Contract writer TX still not ready. Try again.");
      return;
    }
  };

  return {
    ...wagmiContractWrite,
    // Overwrite wagmi's write async
    writeAsync: sendContractWriteTx,
  };
};
