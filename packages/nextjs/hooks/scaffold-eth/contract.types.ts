import contracts from "../../generated/hardhat_contracts";
import { Abi, AbiParametersToPrimitiveTypes, ExtractAbiEvent, ExtractAbiEventNames, ExtractAbiFunction } from "abitype";
import scaffoldConfig from "~~/scaffold.config";

export type Chain = keyof typeof contracts;

type SelectedChainId = typeof scaffoldConfig["targetNetwork"]["id"];

type Contracts = typeof contracts[SelectedChainId][0]["contracts"];

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

export type AbiFunctionReturnType<TAbi extends Abi, TFunctionName extends string> = AbiParametersToPrimitiveTypes<
  AbiFunctionOutputs<TAbi, TFunctionName>
>[0];

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
