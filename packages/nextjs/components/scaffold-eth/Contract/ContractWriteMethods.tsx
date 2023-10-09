import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { Contract, ContractName, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

export const ContractWriteMethods = ({
  onChange,
  deployedContractData,
}: {
  onChange: () => void;
  deployedContractData: Contract<ContractName>;
}) => {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  ).filter(fn => {
    const isWriteableFunction = fn.stateMutability !== "view" && fn.stateMutability !== "pure";
    return isWriteableFunction;
  });

  if (!functionsToDisplay.length) {
    return <>No write methods</>;
  }

  return (
    <>
      {functionsToDisplay
        .map((fn, idx) => (
          <WriteOnlyFunctionForm
            key={`${fn.name}-${idx}}`}
            abiFunction={fn}
            onChange={onChange}
            contractAddress={deployedContractData.address}
            inheritedBy={(deployedContractData.inheritedFunctions as InheritedFunctions)[fn.name]}
          />
        ))
        .sort((a, b) => (b.props.inheritedBy ? b.props.inheritedBy.localeCompare(a.props.inheritedBy) : 1))}
    </>
  );
};
