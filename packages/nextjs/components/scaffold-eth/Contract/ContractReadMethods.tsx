import { ReadOnlyFunctionForm } from "./ReadOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

export const ContractReadMethods = ({ deployedContractData }: { deployedContractData: Contract<ContractName> }) => {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    ((deployedContractData.abi || []) as Abi).filter(part => part.type === "function") as AbiFunction[]
  ).filter(fn => {
    const isQueryableWithParams =
      (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length > 0;
    return isQueryableWithParams;
  });

  if (!functionsToDisplay.length) {
    return <>No read methods</>;
  }

  return (
    <>
      {functionsToDisplay.map(fn => (
        <ReadOnlyFunctionForm contractAddress={deployedContractData.address} abiFunction={fn} key={fn.name} />
      ))}
    </>
  );
};
