import { WriteOnlyFunctionForm } from "./WriteOnlyFunctionForm";
import { Abi, AbiFunction } from "abitype";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

export const ContractWriteMethods = ({
  contractName,
  onChange,
}: {
  contractName: ContractName;
  onChange: () => void;
}) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);

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
      {functionsToDisplay.map((fn, idx) => (
        <WriteOnlyFunctionForm
          key={`${fn.name}-${idx}}`}
          abiFunction={fn}
          onChange={onChange}
          contractAddress={deployedContractData.address}
        />
      ))}
    </>
  );
};
