import { useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { displayTxResult } from "~~/components/scaffold-eth";
import { useAnimationConfig, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { ContractAbi, ContractName } from "~~/utils/scaffold-eth/contract";

type DisplayVariableProps<
  TContractName extends ContractName,
  TFunctionName extends Extract<
    ContractAbi<TContractName>[number],
    {
      readonly stateMutability: "view" | "pure";
      readonly inputs: readonly [];
    }
  >["name"],
> = {
  contractName: TContractName;
  functionName: TFunctionName;
  refreshDisplayVariables: boolean;
};

export const DisplayVariable = <
  TContractName extends ContractName,
  TFunctionName extends Extract<
    ContractAbi<TContractName>[number],
    {
      readonly stateMutability: "view" | "pure";
      readonly inputs: readonly [];
    }
  >["name"],
>({
  contractName,
  functionName,
  refreshDisplayVariables,
}: DisplayVariableProps<TContractName, TFunctionName>) => {
  const {
    data: result,
    isFetching,
    refetch,
  } = useScaffoldContractRead({
    contractName,
    functionName,
    onError: (error: any) => {
      notification.error(error.message);
    },
  } as any); // TODO: fix any

  const { showAnimation } = useAnimationConfig(result);

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-lg mb-0 break-all">{functionName}</h3>
        <button className={`btn btn-ghost btn-xs ${isFetching ? "loading" : ""}`} onClick={async () => await refetch()}>
          {!isFetching && <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />}
        </button>
      </div>
      <div className="text-gray-500 font-medium flex flex-col items-start">
        <div>
          <div
            className={`break-all block transition bg-transparent ${
              showAnimation ? "bg-warning rounded-sm animate-pulse-fast" : ""
            }`}
          >
            {displayTxResult(result)}
          </div>
        </div>
      </div>
    </div>
  );
};
