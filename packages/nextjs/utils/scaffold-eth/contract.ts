import { TransactionReceipt } from "@ethersproject/abstract-provider";
import {
  Abi,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiFunction,
} from "abitype";
import type { ExtractAbiFunctionNames } from "abitype";
import { UseContractEventConfig, UseContractReadConfig, UseContractWriteConfig } from "wagmi";
import contractsData from "~~/generated/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

export type GenericContractsDeclaration = {
  [key: number]: readonly {
    name: string;
    chainId: string;
    contracts: {
      [key: string]: {
        address: string;
        abi: Abi;
      };
    };
  }[];
};

export const contracts = contractsData as GenericContractsDeclaration | null;

type ConfiguredChainId = (typeof scaffoldConfig)["targetNetwork"]["id"];

type IsContractDeclarationMissing<TYes, TNo> = typeof contractsData extends { [key in ConfiguredChainId]: any }
  ? TNo
  : TYes;

type ContractsDeclaration = IsContractDeclarationMissing<GenericContractsDeclaration, typeof contractsData>;

export type Chain = keyof ContractsDeclaration;

type Contracts = ContractsDeclaration[ConfiguredChainId][0]["contracts"];

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
  AbiParametersToPrimitiveTypes<AbiFunctionOutputs<TAbi, TFunctionName>>[0]
>;

export type AbiEventInputs<TAbi extends Abi, TEventName extends ExtractAbiEventNames<TAbi>> = ExtractAbiEvent<
  TAbi,
  TEventName
>["inputs"];

export type AbiEventArgs<
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>,
> = AbiParametersToPrimitiveTypes<AbiEventInputs<TAbi, TEventName>>;

export enum ContractCodeStatus {
  "LOADING",
  "DEPLOYED",
  "NOT_FOUND",
}

type AbiStateMutability = "pure" | "view" | "nonpayable" | "payable";

export type FunctionNamesWithoutInputs<
  TAbi extends Abi,
  TAbiStateMutibility extends AbiStateMutability = AbiStateMutability,
> = Extract<
  TAbi[number],
  {
    type: "function";
    stateMutability: TAbiStateMutibility;
    inputs: readonly [];
  }
>["name"];

export type FunctionNamesWithInputs<
  TAbi extends Abi,
  TAbiStateMutibility extends AbiStateMutability = AbiStateMutability,
> = Exclude<
  Extract<
    TAbi[number],
    {
      type: "function";
      stateMutability: TAbiStateMutibility;
    }
  >,
  {
    inputs: readonly [];
  }
>["name"];

type ReadAbiStateMutability = "view" | "pure";
type WriteAbiStateMutability = "nonpayable" | "payable";

type RestConfigParam<TAbiStateMutability extends AbiStateMutability> = Partial<
  Omit<
    TAbiStateMutability extends ReadAbiStateMutability
      ? UseContractReadConfig
      : UseContractWriteConfig<"recklesslyUnprepared">,
    "chainId" | "abi" | "address" | "functionName" | "args"
  >
>;

type Expand<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;

type UnionToIntersection<U> = Expand<(U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never>;

type OptionalTupple<T> = T extends readonly [infer H, ...infer R] ? readonly [H | undefined, ...OptionalTupple<R>] : T;

type UseScaffoldArgsParam<
  TContractName extends ContractName,
  TAbiStateMutability extends AbiStateMutability,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, TAbiStateMutability>,
> = TFunctionName extends FunctionNamesWithInputs<ContractAbi<TContractName>, TAbiStateMutability>
  ? {
      args: OptionalTupple<UnionToIntersection<AbiFunctionArguments<ContractAbi<TContractName>, TFunctionName>>>;
    }
  : {
      args?: never;
    };

export type UseScaffoldReadConfig<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, ReadAbiStateMutability>,
> = {
  contractName: TContractName;
} & IsContractDeclarationMissing<
  Partial<UseContractReadConfig>,
  {
    functionName: TFunctionName;
  } & UseScaffoldArgsParam<TContractName, ReadAbiStateMutability, TFunctionName> &
    RestConfigParam<ReadAbiStateMutability>
>;

export type UseScaffoldWriteConfig<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, WriteAbiStateMutability>,
> = {
  contractName: TContractName;
  value?: string;
  onBlockConfirmation?: (txnReceipt: TransactionReceipt) => void;
  blockConfirmations?: number;
} & IsContractDeclarationMissing<
  Partial<UseContractWriteConfig<"recklesslyUnprepared">> & { args?: unknown[] },
  {
    functionName: TFunctionName;
  } & UseScaffoldArgsParam<TContractName, WriteAbiStateMutability, TFunctionName> &
    RestConfigParam<WriteAbiStateMutability>
>;

export type UseScaffoldEventConfig<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
  TEventInputs extends AbiEventArgs<ContractAbi<TContractName>, TEventName> & any[],
> = {
  contractName: TContractName;
} & IsContractDeclarationMissing<
  UseContractEventConfig & { listener: (...args: any[]) => void },
  {
    eventName: TEventName;
    listener: (...args: TEventInputs) => void;
    once?: boolean;
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
> = {
  contractName: TContractName;
  eventName: IsContractDeclarationMissing<string, TEventName>;
  fromBlock: number;
  filters?: EventFilters<TContractName, TEventName>;
  blockData?: boolean;
  transactionData?: boolean;
  receiptData?: boolean;
};
