import { useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useContractRead } from "wagmi";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
} from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type TReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
};

export const ReadOnlyFunctionForm = ({ contractAddress, abiFunction }: TReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [result, setResult] = useState<unknown>();

  const { isFetching, refetch } = useContractRead({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: [abiFunction] as Abi,
    args: getParsedContractFunctionArgs(form),
    enabled: false,
    onError: (error: any) => {
      notification.error(error.message);
    },
  });

  const inputElements = abiFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
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
      <p className="font-medium my-0 break-words">{abiFunction.name}</p>
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
            const { data } = await refetch();
            setResult(data);
          }}
        >
          Read 📡
        </button>
      </div>
    </div>
  );
};
