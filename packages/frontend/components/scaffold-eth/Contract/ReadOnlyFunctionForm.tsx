import { FunctionFragment } from "ethers/lib/utils";
import { createRef, FC, useMemo, useState } from "react";
import { useContractRead } from "wagmi";
import { tryToDisplay } from "./displayUtils";
import InputUI from "./InputUI";
import { getFunctionInputKey } from "./utils";

const getInitialForm = (functionFragment: FunctionFragment) => {
  const initialForm: Record<string, any> = {};
  functionFragment.inputs.forEach((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

interface IFunctionForm {
  functionFragment: FunctionFragment;
  contractAddress: string;
}

export const ReadOnlyFunctionForm: FC<IFunctionForm> = ({ functionFragment, contractAddress }) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialForm(functionFragment));
  const refs = useMemo(
    () => Array.from({ length: functionFragment.inputs.length }).map(() => createRef<HTMLInputElement>()),
    [functionFragment.inputs.length],
  );

  const keys = Object.keys(form);

  const { data: Result, isFetching } = useContractRead({
    addressOrName: contractAddress,
    contractInterface: [functionFragment],
    functionName: functionFragment.name,
    args: keys.map(key => form[key]),
  });
  console.log("⚡️ ~ file: InputUI.tsx ~ line 35 ~ isFetching", isFetching);

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
        ref={refs[inputIndex]}
      />
    );
  });

  return (
    <div className="flex flex-col items-start space-y-2 border-b-2 border-black pb-2">
      <p className="text-black my-0">{functionFragment.name}</p>
      {inputs}
      <button
        className={`btn btn-primary btn-sm ${isFetching && "loading"}`}
        onClick={async () => {
          setForm(prevState => {
            const formUpdate = { ...prevState };
            refs.forEach(element => {
              if (element.current) {
                formUpdate[element.current.name] = element.current.value;
              }
            });
            return formUpdate;
          });
        }}
      >
        Read📡
      </button>
      {tryToDisplay(Result)}
    </div>
  );
};
