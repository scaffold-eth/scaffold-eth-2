import { Abi, AbiParametersToPrimitiveTypes, ExtractAbiEvent, ExtractAbiEventNames, ExtractAbiFunction } from "abitype";
import type { ExtractAbiFunctionNames } from "abitype";
import { UseContractReadConfig, UseContractWriteConfig } from "wagmi";
import scaffoldConfig, { ScaffoldConfig } from "~~/scaffold.config";

export type GenericContractsDeclaration = Exclude<ScaffoldConfig["contracts"], null>;

const contracts = scaffoldConfig.contracts;

type IsContractsFileMissing<TYes, TNo> = typeof contracts extends null ? TYes : TNo;
type ContractsDeclaration = IsContractsFileMissing<GenericContractsDeclaration, typeof contracts>;

export type Chain = keyof ContractsDeclaration;

type SelectedChainId = IsContractsFileMissing<number, (typeof scaffoldConfig)["targetNetwork"]["id"]>;

type Contracts = ContractsDeclaration[SelectedChainId][0]["contracts"];

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

export type AbiFunctionReturnType<TAbi extends Abi, TFunctionName extends string> = IsContractsFileMissing<
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
    TAbiStateMutability extends ReadAbiStateMutability ? UseContractReadConfig : UseContractWriteConfig,
    "chainId" | "abi" | "address" | "functionName" | "args"
  >
>;

type OptionalTupple<T> = T extends readonly [infer H, ...infer R] ? readonly [H | undefined, ...OptionalTupple<R>] : T;

type UseScaffoldArgsParam<
  TContractName extends ContractName,
  TAbiStateMutability extends AbiStateMutability,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, TAbiStateMutability>,
> = TFunctionName extends FunctionNamesWithInputs<ContractAbi<TContractName>, TAbiStateMutability>
  ? {
      args: OptionalTupple<AbiFunctionArguments<ContractAbi<TContractName>, TFunctionName>>;
    }
  : {
      args?: never;
    };

export type UseScaffoldReadConfig<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, ReadAbiStateMutability>,
> = {
  contractName: TContractName;
} & IsContractsFileMissing<
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
} & IsContractsFileMissing<
  Partial<UseContractWriteConfig> & { args?: unknown[] },
  {
    functionName: TFunctionName;
  } & UseScaffoldArgsParam<TContractName, WriteAbiStateMutability, TFunctionName> &
    RestConfigParam<WriteAbiStateMutability>
>;
