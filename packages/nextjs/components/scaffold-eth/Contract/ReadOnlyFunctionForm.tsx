import { useState } from "react";
import { FunctionFragment } from "ethers/lib/utils";
import { useContractRead } from "wagmi";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getParsedContractFunctionArgs,
} from "~~/components/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

const getInitialFormState = (functionFragment: FunctionFragment) => {
  const initialForm: Record<string, any> = {};
  functionFragment.inputs.forEach((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

type TReadOnlyFunctionFormProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
};

export const ReadOnlyFunctionForm = ({ functionFragment, contractAddress }: TReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(functionFragment));
  const [result, setResult] = useState<unknown>();

  const { isFetching, refetch } = useContractRead({
    chainId: getTargetNetwork().id,
    address: contractAddress,
    abi: [functionFragment],
    functionName: functionFragment.name,
    args: getParsedContractFunctionArgs(form),
    enabled: false,
    onError: error => {
      notification.error(error.message);
    },
  });

  const inputs = functionFragment.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
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
      <p className="font-medium my-0 break-words">{functionFragment.name}</p>
      {inputs}
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
