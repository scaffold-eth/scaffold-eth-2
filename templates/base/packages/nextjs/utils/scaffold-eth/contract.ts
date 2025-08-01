import { getParsedError } from "./getParsedError";
import { AllowedChainIds } from "./networks";
import { notification } from "./notification";
import { MutateOptions } from "@tanstack/react-query";
import {
  Abi,
  AbiParameter,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiFunction,
} from "abitype";
import type { ExtractAbiFunctionNames } from "abitype";
import type { Simplify } from "type-fest";
import type { MergeDeepRecord } from "type-fest/source/merge-deep";
import {
  Address,
  Block,
  GetEventArgs,
  GetTransactionReceiptReturnType,
  GetTransactionReturnType,
  Log,
  TransactionReceipt,
  WriteContractErrorType,
  keccak256,
  toHex,
} from "viem";
import { Config, UseReadContractParameters, UseWatchContractEventParameters, UseWriteContractParameters } from "wagmi";
import { WriteContractParameters, WriteContractReturnType, simulateContract } from "wagmi/actions";
import { WriteContractVariables } from "wagmi/query";
import deployedContractsData from "~~/contracts/deployedContracts";
import externalContractsData from "~~/contracts/externalContracts";
import scaffoldConfig from "~~/scaffold.config";

type AddExternalFlag<T> = {
  [ChainId in keyof T]: {
    [ContractName in keyof T[ChainId]]: T[ChainId][ContractName] & { external?: true };
  };
};

const deepMergeContracts = <L extends Record<PropertyKey, any>, E extends Record<PropertyKey, any>>(
  local: L,
  external: E,
) => {
  const result: Record<PropertyKey, any> = {};
  const allKeys = Array.from(new Set([...Object.keys(external), ...Object.keys(local)]));
  for (const key of allKeys) {
    if (!external[key]) {
      result[key] = local[key];
      continue;
    }
    const amendedExternal = Object.fromEntries(
      Object.entries(external[key] as Record<string, Record<string, unknown>>).map(([contractName, declaration]) => [
        contractName,
        { ...declaration, external: true },
      ]),
    );
    result[key] = { ...local[key], ...amendedExternal };
  }
  return result as MergeDeepRecord<AddExternalFlag<L>, AddExternalFlag<E>, { arrayMergeMode: "replace" }>;
};

const contractsData = deepMergeContracts(deployedContractsData, externalContractsData);

export type InheritedFunctions = { readonly [key: string]: string };

export type GenericContract = {
  address: Address;
  abi: Abi;
  inheritedFunctions?: InheritedFunctions;
  external?: true;
  deployedOnBlock?: number;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};

export const contracts = contractsData as GenericContractsDeclaration | null;

type ConfiguredChainId = (typeof scaffoldConfig)["targetNetworks"][0]["id"];

type IsContractDeclarationMissing<TYes, TNo> = typeof contractsData extends { [key in ConfiguredChainId]: any }
  ? TNo
  : TYes;

type ContractsDeclaration = IsContractDeclarationMissing<GenericContractsDeclaration, typeof contractsData>;

type Contracts = ContractsDeclaration[ConfiguredChainId];

export type ContractName = keyof Contracts;

export type Contract<TContractName extends ContractName> = Contracts[TContractName];

type InferContractAbi<TContract> = TContract extends { abi: infer TAbi } ? TAbi : never;

export type ContractAbi<TContractName extends ContractName = ContractName> = InferContractAbi<Contract<TContractName>>;

export type AbiFunctionInputs<TAbi extends Abi, TFunctionName extends string> = ExtractAbiFunction<
  TAbi,
  TFunctionName
>["inputs"];

export type AbiFunctionArguments<TAbi extends Abi, TFunctionName extends string> = AbiParametersToPrimitiveTypes<
  AbiFunctionInputs<TAbi, TFunctionName>
>;

export type AbiFunctionOutputs<TAbi extends Abi, TFunctionName extends string> = ExtractAbiFunction<
  TAbi,
  TFunctionName
>["outputs"];

export type AbiFunctionReturnType<TAbi extends Abi, TFunctionName extends string> = IsContractDeclarationMissing<
  any,
  AbiParametersToPrimitiveTypes<AbiFunctionOutputs<TAbi, TFunctionName>> extends readonly [any]
    ? AbiParametersToPrimitiveTypes<AbiFunctionOutputs<TAbi, TFunctionName>>[0]
    : AbiParametersToPrimitiveTypes<AbiFunctionOutputs<TAbi, TFunctionName>>
>;

export type AbiEventInputs<TAbi extends Abi, TEventName extends ExtractAbiEventNames<TAbi>> = ExtractAbiEvent<
  TAbi,
  TEventName
>["inputs"];

export enum ContractCodeStatus {
  "LOADING",
  "DEPLOYED",
  "NOT_FOUND",
}

type AbiStateMutability = "pure" | "view" | "nonpayable" | "payable";
export type ReadAbiStateMutability = "view" | "pure";
export type WriteAbiStateMutability = "nonpayable" | "payable";

export type FunctionNamesWithInputs<
  TContractName extends ContractName,
  TAbiStateMutability extends AbiStateMutability = AbiStateMutability,
> = Exclude<
  Extract<
    ContractAbi<TContractName>[number],
    {
      type: "function";
      stateMutability: TAbiStateMutability;
    }
  >,
  {
    inputs: readonly [];
  }
>["name"];

type Expand<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;

type UnionToIntersection<U> = Expand<(U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never>;

type OptionalTuple<T> = T extends readonly [infer H, ...infer R] ? readonly [H | undefined, ...OptionalTuple<R>] : T;

type UseScaffoldArgsParam<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>>,
> =
  TFunctionName extends FunctionNamesWithInputs<TContractName>
    ? {
        args: OptionalTuple<UnionToIntersection<AbiFunctionArguments<ContractAbi<TContractName>, TFunctionName>>>;
        value?: ExtractAbiFunction<ContractAbi<TContractName>, TFunctionName>["stateMutability"] extends "payable"
          ? bigint | undefined
          : undefined;
      }
    : {
        args?: never;
      };

export type UseDeployedContractConfig<TContractName extends ContractName> = {
  contractName: TContractName;
  chainId?: AllowedChainIds;
};

export type UseScaffoldWriteConfig<TContractName extends ContractName> = {
  contractName: TContractName;
  chainId?: AllowedChainIds;
  disableSimulate?: boolean;
  writeContractParams?: UseWriteContractParameters;
};

export type UseScaffoldReadConfig<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, ReadAbiStateMutability>,
> = {
  contractName: TContractName;
  chainId?: AllowedChainIds;
  watch?: boolean;
} & IsContractDeclarationMissing<
  Partial<UseReadContractParameters>,
  {
    functionName: TFunctionName;
  } & UseScaffoldArgsParam<TContractName, TFunctionName> &
    Omit<UseReadContractParameters, "chainId" | "abi" | "address" | "functionName" | "args">
>;

export type ScaffoldWriteContractVariables<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, WriteAbiStateMutability>,
> = IsContractDeclarationMissing<
  Partial<WriteContractParameters>,
  {
    functionName: TFunctionName;
  } & UseScaffoldArgsParam<TContractName, TFunctionName> &
    Omit<WriteContractParameters, "chainId" | "abi" | "address" | "functionName" | "args">
>;

type WriteVariables = WriteContractVariables<Abi, string, any[], Config, number>;

export type TransactorFuncOptions = {
  onBlockConfirmation?: (txnReceipt: TransactionReceipt) => void;
  blockConfirmations?: number;
};

export type ScaffoldWriteContractOptions = MutateOptions<
  WriteContractReturnType,
  WriteContractErrorType,
  WriteVariables,
  unknown
> &
  TransactorFuncOptions;

export type UseScaffoldEventConfig<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TEvent extends ExtractAbiEvent<ContractAbi<TContractName>, TEventName> = ExtractAbiEvent<
    ContractAbi<TContractName>,
    TEventName
  >,
> = {
  contractName: TContractName;
  eventName: TEventName;
  chainId?: AllowedChainIds;
} & IsContractDeclarationMissing<
  Omit<UseWatchContractEventParameters, "onLogs" | "address" | "abi" | "eventName"> & {
    onLogs: (
      logs: Simplify<
        Omit<Log<bigint, number, any>, "args" | "eventName"> & {
          args: Record<string, unknown>;
          eventName: string;
        }
      >[],
    ) => void;
  },
  Omit<UseWatchContractEventParameters<ContractAbi<TContractName>>, "onLogs" | "address" | "abi" | "eventName"> & {
    onLogs: (
      logs: Simplify<
        Omit<Log<bigint, number, false, TEvent, false, [TEvent], TEventName>, "args"> & {
          args: AbiParametersToPrimitiveTypes<TEvent["inputs"]> &
            GetEventArgs<
              ContractAbi<TContractName>,
              TEventName,
              {
                IndexedOnly: false;
              }
            >;
        }
      >[],
    ) => void;
  }
>;

type IndexedEventInputs<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
> = Extract<AbiEventInputs<ContractAbi<TContractName>, TEventName>[number], { indexed: true }>;

export type EventFilters<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
> = IsContractDeclarationMissing<
  any,
  IndexedEventInputs<TContractName, TEventName> extends never
    ? never
    : {
        [Key in IsContractDeclarationMissing<
          any,
          IndexedEventInputs<TContractName, TEventName>["name"]
        >]?: AbiParameterToPrimitiveType<Extract<IndexedEventInputs<TContractName, TEventName>, { name: Key }>>;
      }
>;

export type UseScaffoldEventHistoryConfig<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TBlockData extends boolean = false,
  TTransactionData extends boolean = false,
  TReceiptData extends boolean = false,
> = {
  contractName: TContractName;
  eventName: IsContractDeclarationMissing<string, TEventName>;
  fromBlock?: bigint;
  toBlock?: bigint;
  chainId?: AllowedChainIds;
  filters?: EventFilters<TContractName, TEventName>;
  blockData?: TBlockData;
  transactionData?: TTransactionData;
  receiptData?: TReceiptData;
  watch?: boolean;
  enabled?: boolean;
  blocksBatchSize?: number;
};

export type UseScaffoldEventHistoryData<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TBlockData extends boolean = false,
  TTransactionData extends boolean = false,
  TReceiptData extends boolean = false,
  TEvent extends ExtractAbiEvent<ContractAbi<TContractName>, TEventName> = ExtractAbiEvent<
    ContractAbi<TContractName>,
    TEventName
  >,
> =
  | IsContractDeclarationMissing<
      any[],
      {
        args: AbiParametersToPrimitiveTypes<TEvent["inputs"]> &
          GetEventArgs<
            ContractAbi<TContractName>,
            TEventName,
            {
              IndexedOnly: false;
            }
          >;
        blockData: TBlockData extends true ? Block<bigint, true> : null;
        receiptData: TReceiptData extends true ? GetTransactionReturnType : null;
        transactionData: TTransactionData extends true ? GetTransactionReceiptReturnType : null;
      } & Log<bigint, number, false, TEvent, false, [TEvent], TEventName>[]
    >
  | undefined;

export type AbiParameterTuple = Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>;

/**
 * Enhanced error parsing that creates a lookup table from all deployed contracts
 * to decode error signatures from any contract in the system
 */
export const getParsedErrorWithAllAbis = (error: any, chainId: AllowedChainIds): string => {
  const originalParsedError = getParsedError(error);

  // Check if this is an unrecognized error signature
  if (/Encoded error signature.*not found on ABI/i.test(originalParsedError)) {
    const signatureMatch = originalParsedError.match(/0x[a-fA-F0-9]{8}/);
    const signature = signatureMatch ? signatureMatch[0] : "";

    if (!signature) {
      return originalParsedError;
    }

    try {
      // Get all deployed contracts for the current chain
      const chainContracts = deployedContractsData[chainId as keyof typeof deployedContractsData];

      if (!chainContracts) {
        return originalParsedError;
      }

      // Build a lookup table of error signatures to error names
      const errorLookup: Record<string, { name: string; contract: string; signature: string }> = {};

      Object.entries(chainContracts).forEach(([contractName, contract]: [string, any]) => {
        if (contract.abi) {
          contract.abi.forEach((item: any) => {
            if (item.type === "error") {
              // Create the proper error signature like Solidity does
              const errorName = item.name;
              const inputs = item.inputs || [];
              const inputTypes = inputs.map((input: any) => input.type).join(",");
              const errorSignature = `${errorName}(${inputTypes})`;

              // Hash the signature and take the first 4 bytes (8 hex chars)
              const hash = keccak256(toHex(errorSignature));
              const errorSelector = hash.slice(0, 10); // 0x + 8 chars = 10 total

              errorLookup[errorSelector] = {
                name: errorName,
                contract: contractName,
                signature: errorSignature,
              };
            }
          });
        }
      });

      // Check if we can find the error in our lookup
      const errorInfo = errorLookup[signature];
      if (errorInfo) {
        return `Contract function execution reverted with the following reason:\n${errorInfo.signature} from ${errorInfo.contract} contract`;
      }

      // If not found in simple lookup, provide a helpful message with context
      return `${originalParsedError}\n\nThis error occurred when calling a function that internally calls another contract. Check the contract that your function calls internally for more details.`;
    } catch (lookupError) {
      console.log("Failed to create error lookup table:", lookupError);
    }
  }

  return originalParsedError;
};

export const simulateContractWriteAndNotifyError = async ({
  wagmiConfig,
  writeContractParams: params,
  chainId,
}: {
  wagmiConfig: Config;
  writeContractParams: WriteContractVariables<Abi, string, any[], Config, number>;
  chainId: AllowedChainIds;
}) => {
  try {
    await simulateContract(wagmiConfig, params);
  } catch (error) {
    const parsedError = getParsedErrorWithAllAbis(error, chainId);

    notification.error(parsedError);
    throw error;
  }
};
