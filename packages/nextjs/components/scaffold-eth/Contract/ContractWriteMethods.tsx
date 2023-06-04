import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName, FunctionNamesWithInputs, WriteAbiStateMutability } from "~~/utils/scaffold-eth/contract";

export const ContractWriteMethods = ({
  contractName,
  onChange,
}: {
  contractName: ContractName;
  onChange: () => void;
}) => {
  const { data: deployedContractData, isLoading } = useDeployedContractInfo(contractName);

  if (isLoading) {
    return <>Loading...</>;
  }

  const functionsToDisplay = (
    ((deployedContractData?.abi || []) as Abi).filter(part => part.type === "function") as AbiFunction[]
  ).filter(fn => {
    const isWriteableFunction = fn.stateMutability !== "view" && fn.stateMutability !== "pure";
    return isWriteableFunction;
  });

  if (!functionsToDisplay.length) {
    return <>No write methods</>;
  }

  return (
    <>
      {functionsToDisplay.map(fn => (
        <WriteOnlyFunctionForm
          key={fn.name}
          contractName={contractName}
          functionName={fn.name as FunctionNamesWithInputs<ContractName, WriteAbiStateMutability>}
          inputs={fn.inputs}
          isPayable={fn.stateMutability === "payable"}
          onChange={onChange}
        />
      ))}
    </>
  );
};
