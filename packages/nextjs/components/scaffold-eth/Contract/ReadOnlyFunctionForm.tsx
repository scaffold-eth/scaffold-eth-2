import { useState } from "react";
import { AbiParameter } from "abitype";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getParsedContractFunctionArgs,
} from "~~/components/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName, FunctionNamesWithInputs, ReadAbiStateMutability } from "~~/utils/scaffold-eth/contract";

const getInitialFormState = (functionName: string, inputs: readonly AbiParameter[]) => {
  const initialForm: Record<string, any> = {};
  inputs.forEach((input, inputIndex) => {
    const key = getFunctionInputKey(functionName, input, inputIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

type TReadOnlyFunctionFormProps = {
  contractName: ContractName;
  functionName: FunctionNamesWithInputs<ContractName, ReadAbiStateMutability>;
  inputs: readonly AbiParameter[];
};

export const ReadOnlyFunctionForm = ({ contractName, functionName, inputs }: TReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(functionName, inputs));
  const [result, setResult] = useState<unknown>();

  const { isFetching, refetch } = useScaffoldContractRead({
    contractName,
    functionName,
    args: getParsedContractFunctionArgs(form),
    enabled: false,
    onError: (error: any) => {
      notification.error(error.message);
    },
  } as any); // TODO: fix any

  const inputElements = inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(functionName, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="font-medium my-0 break-words">{functionName}</p>
      {inputElements}
      <div className="flex justify-between gap-2">
        <div className="flex-grow">
          {result !== null && result !== undefined && (
            <span className="block bg-secondary rounded-3xl text-sm px-4 py-1.5">
              <strong>Result</strong>: {displayTxResult(result)}
            </span>
          )}
        </div>
        <button
          className={`btn btn-secondary btn-sm ${isFetching ? "loading" : ""}`}
          onClick={async () => {
            const data = await refetch();
            setResult(data);
          }}
        >
          Read 📡
        </button>
      </div>
    </div>
  );
};
