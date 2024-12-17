import { useEffect, useState } from "react";
import { MutateOptions } from "@tanstack/react-query";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { Config, UseWriteContractParameters, useAccount, useWriteContract } from "wagmi";
import { WriteContractErrorType, WriteContractReturnType } from "wagmi/actions";
import { WriteContractVariables } from "wagmi/query";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { AllowedChainIds, notification } from "~~/utils/scaffold-eth";
import {
  ContractAbi,
  ContractName,
  ScaffoldWriteContractOptions,
  ScaffoldWriteContractVariables,
  UseScaffoldWriteConfig,
} from "~~/utils/scaffold-eth/contract";

type ScaffoldWriteContractReturnType<TContractName extends ContractName> = Omit<
  ReturnType<typeof useWriteContract>,
  "writeContract" | "writeContractAsync"
> & {
  isMining: boolean;
  writeContractAsync: <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: ScaffoldWriteContractOptions,
  ) => Promise<WriteContractReturnType | undefined>;
  writeContract: <TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">>(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
  ) => void;
};

export function useScaffoldWriteContract<TContractName extends ContractName>(
  config: UseScaffoldWriteConfig<TContractName>,
): ScaffoldWriteContractReturnType<TContractName>;
/**
 * @deprecated Use object parameter version instead: useScaffoldWriteContract({ contractName: "YourContract" })
 */
export function useScaffoldWriteContract<TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: UseWriteContractParameters,
): ScaffoldWriteContractReturnType<TContractName>;

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - name of the contract to be written to
 * @param config.chainId - optional chainId that is configured with the scaffold project to make use for multi-chain interactions.
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
export function useScaffoldWriteContract<TContractName extends ContractName>(
  configOrName: UseScaffoldWriteConfig<TContractName> | TContractName,
  writeContractParams?: UseWriteContractParameters,
): ScaffoldWriteContractReturnType<TContractName> {
  const finalConfig =
    typeof configOrName === "string"
      ? { contractName: configOrName, writeContractParams, chainId: undefined }
      : (configOrName as UseScaffoldWriteConfig<TContractName>);
  const { contractName, chainId, writeContractParams: finalWriteContractParams } = finalConfig;

  useEffect(() => {
    if (typeof configOrName === "string") {
      console.warn(
        "Using `useScaffoldWriteContract` with a string parameter is deprecated. Please use the object parameter version instead.",
      );
    }
  }, [configOrName]);

  const { chain: accountChain } = useAccount();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);

  const wagmiContractWrite = useWriteContract(finalWriteContractParams);

  const selectedNetwork = useSelectedNetwork(chainId);

  const { data: deployedContractData } = useDeployedContractInfo({
    contractName,
    chainId: selectedNetwork.id as AllowedChainIds,
  });

  const sendContractWriteAsyncTx = async <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: ScaffoldWriteContractOptions,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    if (!accountChain?.id) {
      notification.error("Please connect your wallet");
      return;
    }

    if (accountChain?.id !== selectedNetwork.id) {
      notification.error(`Wallet is connected to the wrong network. Please switch to ${selectedNetwork.name}`);
      return;
    }

    try {
      setIsMining(true);
      const { blockConfirmations, onBlockConfirmation, ...mutateOptions } = options || {};
      const makeWriteWithParams = () =>
        wagmiContractWrite.writeContractAsync(
          {
            abi: deployedContractData.abi as Abi,
            address: deployedContractData.address,
            ...variables,
          } as WriteContractVariables<Abi, string, any[], Config, number>,
          mutateOptions as
            | MutateOptions<
                WriteContractReturnType,
                WriteContractErrorType,
                WriteContractVariables<Abi, string, any[], Config, number>,
                unknown
              >
            | undefined,
        );
      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      return writeTxResult;
    } catch (e: any) {
      throw e;
    } finally {
      setIsMining(false);
    }
  };

  const sendContractWriteTx = <
    TContractName extends ContractName,
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }
    if (!accountChain?.id) {
      notification.error("Please connect your wallet");
      return;
    }

    if (accountChain?.id !== selectedNetwork.id) {
      notification.error(`Wallet is connected to the wrong network. Please switch to ${selectedNetwork.name}`);
      return;
    }

    wagmiContractWrite.writeContract(
      {
        abi: deployedContractData.abi as Abi,
        address: deployedContractData.address,
        ...variables,
      } as WriteContractVariables<Abi, string, any[], Config, number>,
      options as
        | MutateOptions<
            WriteContractReturnType,
            WriteContractErrorType,
            WriteContractVariables<Abi, string, any[], Config, number>,
            unknown
          >
        | undefined,
    );
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's writeContactAsync
    writeContractAsync: sendContractWriteAsyncTx,
    // Overwrite wagmi's writeContract
    writeContract: sendContractWriteTx,
  };
}
