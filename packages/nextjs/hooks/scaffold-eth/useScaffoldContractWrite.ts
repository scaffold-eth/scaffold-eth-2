import { utils } from "ethers";
import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { getParsedEthersError } from "~~/components/scaffold-eth/Contract/utilsContract";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { useDeployedContractInfo } from "./useDeployedContractInfo";

/**
 * @dev wrapper for wagmi's useContractWrite hook(with config prepared by usePrepareContractWrite hook) which loads in deployed contract abi and address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param args - arguments for the function
 * @param value - value in ETH that will be sent with transaction
 */
export const useScaffoldContractWrite = (contractName: string, functionName: string, args?: any[], value?: string) => {
  const configuredChain = getTargetNetwork();
  const deployedContractData = useDeployedContractInfo(contractName);
  const { chain } = useNetwork();
  const writeTx = useTransactor();

  const { config } = usePrepareContractWrite({
    chainId: configuredChain.id,
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
      notification.error("Target Contract is not deployed, did you forgot to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== configuredChain.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (wagmiContractWrite.writeAsync && writeTx) {
      try {
        await writeTx(wagmiContractWrite.writeAsync());
      } catch (e: any) {
        const message = getParsedEthersError(e);
        notification.error(message);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  return {
    ...wagmiContractWrite,
    // Overwrite wagmi's write async
    writeAsync: sendContractWriteTx,
  };
};
