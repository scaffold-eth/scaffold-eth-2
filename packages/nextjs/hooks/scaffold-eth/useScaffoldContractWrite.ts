import { useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { Config, UseWriteContractParameters, useAccount, useWriteContract } from "wagmi";
import { WriteContractVariables } from "wagmi/query";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { ContractAbi, ContractName, scaffoldWriteContractVariables } from "~~/utils/scaffold-eth/contract";

// TODO: Update comment and handle value autocompleteion
/**
 * Wrapper around wagmi's useContractWrite hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - arguments for the function
 * @param config.value - value in ETH that will be sent with transaction
 * @param config.blockConfirmations - number of block confirmations to wait for (default: 1)
 * @param config.onBlockConfirmation - callback that will be called after blockConfirmations.
 */
export const useScaffoldWriteContract = <TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: UseWriteContractParameters,
) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { chain } = useAccount();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const { targetNetwork } = useTargetNetwork();

  const wagmiContractWrite = useWriteContract(writeContractParams);

  // TODO: Pass in second arg option to it
  const sendContractWriteTx = async <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: scaffoldWriteContractVariables<TContractName, TFunctionName>,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You are on the wrong network");
      return;
    }

    try {
      setIsMining(true);
      const makeWriteWithParams = () =>
        wagmiContractWrite.writeContractAsync({
          abi: deployedContractData.abi as Abi,
          address: deployedContractData.address,
          ...variables,
        } as WriteContractVariables<Abi, TFunctionName, any[], Config, number>);
      const writeTxResult = await writeTx(makeWriteWithParams);

      return writeTxResult;
    } catch (e: any) {
      const message = getParsedError(e);
      notification.error(message);
    } finally {
      setIsMining(false);
    }
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's write async
    writeContractAsync: sendContractWriteTx,
  };
};
