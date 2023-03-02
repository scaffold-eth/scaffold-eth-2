import { FunctionFragment } from "ethers/lib/utils";
import { useState } from "react";
import { useContractRead } from "wagmi";
import { displayTxResult } from "./utilsDisplay";
import InputUI from "./InputUI";
import { getFunctionInputKey, getParsedContractFunctionArgs } from "./utilsContract";
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
  const configuredChain = getTargetNetwork();

  const { isFetching, refetch } = useContractRead({
    chainId: configuredChain.id,
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
      <InputUI
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
        functionFragment={functionFragment}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-1">
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
