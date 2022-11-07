import { BigNumber } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import ErrorToast from "~~/components/ErrorToast";
import { tryToDisplay } from "./displayUtils";
import InputUI from "./InputUI";
import { getFunctionInputKey } from "./utils";

// TODO set sensible initial state values to avoid errors on first render
const getInitialFormState = (functionFragment: FunctionFragment) => {
  const initialForm: Record<string, any> = {};
  functionFragment.inputs.forEach((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

// TODO extract this component
const TxValueInput = ({ setTxValue, txValue }: { setTxValue: Dispatch<SetStateAction<string>>; txValue: string }) => {
  return (
    <div className="flex space-x-2 items-center">
      <input
        placeholder="Value"
        autoComplete="off"
        className="input input-sm"
        value={txValue}
        onChange={e => setTxValue(e.target.value)}
      />
      <div
        className="helper-button-contract-input"
        style={{ cursor: "pointer" }}
        onClick={async () => {
          if (!txValue) return;

          const floatValue = parseFloat(txValue);
          if (floatValue) setTxValue("" + floatValue * 10 ** 18);
        }}
      >
        ✴️
      </div>
      <div
        className="helper-button-contract-input"
        style={{ cursor: "pointer" }}
        onClick={async () => {
          setTxValue(BigNumber.from(txValue).toHexString());
        }}
      >
        #️⃣
      </div>
    </div>
  );
};

interface IFunctionForm {
  functionFragment: FunctionFragment;
  contractAddress: string;
}

export const WriteOnlyFunctionForm = ({ functionFragment, contractAddress }: IFunctionForm) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(functionFragment));

  const [txValue, setTxValue] = useState<string>("");
  const [error, setError] = useState("");

  const keys = Object.keys(form);

  // TODO handle gasLimit
  const { config } = usePrepareContractWrite({
    addressOrName: contractAddress,
    functionName: functionFragment.name,
    contractInterface: [functionFragment],
    args: keys.map(key => form[key]),
    overrides: {
      value: txValue,
    },
    onError: error => {
      setError(error.message);
      setTimeout(() => {
        setError("");
      }, 3000);
    },
  });
  const { data: Result, isLoading, write } = useContractWrite(config);

  const handleWrite = () => {
    if (!write) {
      setError("Please input correct value");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }

    write();
  };

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
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

  // TODO Handle Error with nice toast
  return (
    <div className="flex flex-col items-start space-y-2 border-b-2 border-black pb-2">
      <p className="text-black my-0">{functionFragment.name}</p>
      {inputs}
      {functionFragment.payable ? <TxValueInput setTxValue={setTxValue} txValue={txValue} /> : null}
      <button className={`btn btn-primary btn-sm ${isLoading && "loading"}`} onClick={handleWrite}>
        Send 💸
      </button>
      {tryToDisplay(Result)}
      {error && <ErrorToast errorMessage={error} />}
    </div>
  );
};
