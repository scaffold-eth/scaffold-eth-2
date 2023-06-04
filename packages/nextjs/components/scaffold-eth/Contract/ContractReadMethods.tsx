import { ReadOnlyFunctionForm } from "./ReadOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName, FunctionNamesWithInputs, ReadAbiStateMutability } from "~~/utils/scaffold-eth/contract";

export const ContractReadMethods = ({ contractName }: { contractName: ContractName }) => {
  const { data: deployedContractData, isLoading } = useDeployedContractInfo(contractName);

  if (isLoading) {
    return <>Loading...</>;
  }

  const functionsToDisplay = (
    ((deployedContractData?.abi || []) as Abi).filter(part => part.type === "function") as AbiFunction[]
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
        <ReadOnlyFunctionForm
          contractName={contractName}
          functionName={fn.name as FunctionNamesWithInputs<ContractName, ReadAbiStateMutability>}
          inputs={fn.inputs}
          key={fn.name}
        />
      ))}
    </>
  );
};
