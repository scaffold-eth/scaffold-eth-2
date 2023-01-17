import { FunctionFragment } from "ethers/lib/utils";
import { useState } from "react";
import { useContractRead } from "wagmi";
import { tryToDisplay } from "./utilsDisplay";
import InputUI from "./InputUI";
import { getFunctionInputKey } from "./utilsContract";
import { parseAddressTo0x, toast } from "~~/utils/scaffold-eth";

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
  const keys = Object.keys(form);

  const {
    data: result,
    isFetching,
    refetch,
  } = useContractRead({
    address: parseAddressTo0x(contractAddress),
    abi: [functionFragment],
    functionName: functionFragment.name,
    args: keys.map(key => form[key]),
    enabled: false,
    onError: error => {
      toast.error(error.message);
    },
  });

  const inputs = functionFragment.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    return (
      <InputUI
        key={key}
        setForm={setForm}
        form={form}
        stateObjectKey={key}
        paramType={input}
        functionFragment={functionFragment}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium my-0 break-words">{functionFragment.name}</p>
      {inputs}
      <div className="flex justify-between gap-2">
        <div className="flex-grow">
          {result ? (
            <span className="block bg-secondary rounded-3xl text-sm px-4 py-1.5">
              <strong>Result</strong>: {tryToDisplay(result)}
            </span>
          ) : null}
        </div>
        <button
          className={`btn btn-secondary btn-sm ${isFetching ? "loading" : ""}`}
          onClick={async () => {
            await refetch();
          }}
        >
          Read 📡
        </button>
      </div>
    </div>
  );
};
