import { useState } from "react";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { parseEther } from "viem";
import { useContractWrite, useNetwork } from "wagmi";
import { getParsedError } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldWriteConfig } from "~~/utils/scaffold-eth/contract";

type UpdatedArgs = Parameters<ReturnType<typeof useContractWrite<Abi, string, undefined>>["writeAsync"]>[0];

/**
 * @dev wrapper for wagmi's useContractWrite hook(with config prepared by usePrepareContractWrite hook) which loads in deployed contract abi and address automatically
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.proxyContractName - Deployed proxy contract name if you wish to use an address other than the one associated with the contractName (optional)
 * @param config.functionName - name of the function to be called
 * @param config.args - arguments for the function
 * @param config.value - value in ETH that will be sent with transaction
 */
export const useScaffoldContractWrite = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
>({
  contractName,
  proxyContractName,
  functionName,
  args,
  value,
  onBlockConfirmation,
  blockConfirmations,
  ...writeConfig
}: UseScaffoldWriteConfig<TContractName, TFunctionName>) => {
  // If no proxy is given then we default to the given contractName
  if (!proxyContractName) {
    proxyContractName = contractName;
  }
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { data: proxyContractData } = useDeployedContractInfo(proxyContractName);
  const { chain } = useNetwork();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const configuredNetwork = getTargetNetwork();

  const wagmiContractWrite = useContractWrite({
    chainId: configuredNetwork.id,
    address: proxyContractData?.address,
    abi: deployedContractData?.abi as Abi,
    functionName: functionName as any,
    args: args as unknown[],
    value: value ? parseEther(value) : undefined,
    ...writeConfig,
  });

  const sendContractWriteTx = async ({
    args: newArgs,
    value: newValue,
    ...otherConfig
  }: {
    args?: UseScaffoldWriteConfig<TContractName, TFunctionName>["args"];
    value?: UseScaffoldWriteConfig<TContractName, TFunctionName>["value"];
  } & UpdatedArgs = {}) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }
    if (!proxyContractData) {
      notification.error("Proxy Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== configuredNetwork.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (wagmiContractWrite.writeAsync) {
      try {
        setIsMining(true);
        await writeTx(
          () =>
            wagmiContractWrite.writeAsync({
              args: newArgs ?? args,
              value: newValue ? parseEther(newValue) : value && parseEther(value),
              ...otherConfig,
            }),
          { onBlockConfirmation, blockConfirmations },
        );
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      } finally {
        setIsMining(false);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's write async
    writeAsync: sendContractWriteTx,
  };
};
