import { DisplayVariable } from "./DisplayVariable";
import { Abi, AbiFunction } from "abitype";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

export const ContractVariables = ({
  contractName,
  refreshDisplayVariables,
}: {
  contractName: ContractName;
  refreshDisplayVariables: boolean;
}) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  ).filter(fn => {
    const isQueryableWithNoParams =
      (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
    return isQueryableWithNoParams;
  });

  if (!functionsToDisplay.length) {
    return <>No contract variables</>;
  }

  return (
    <>
      {functionsToDisplay.map(fn => (
        <DisplayVariable
          abiFunction={fn}
          contractAddress={deployedContractData.address}
          key={fn.name}
          refreshDisplayVariables={refreshDisplayVariables}
        />
      ))}
    </>
  );
};
