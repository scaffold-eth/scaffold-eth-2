import { BigNumber } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import ErrorToast from "~~/components/ErrorToast";
import { tryToDisplay } from "./utilsDisplay";
import InputUI from "./InputUI";
import { getFunctionInputKey, getParsedEthersError } from "./utils";

// TODO set sensible initial state values to avoid error Toast on first render
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

  // TODO handle gasPrice, handle parsing of proper error
  const { config } = usePrepareContractWrite({
    addressOrName: contractAddress,
    functionName: functionFragment.name,
    contractInterface: [functionFragment],
    args: keys.map(key => form[key]),
    overrides: {
      value: txValue,
    },
    onError: (e: any) => {
      const message = getParsedEthersError(e);
      setError(message);
      setTimeout(() => {
        setError("");
      }, 3000);
    },
  });
  const { data: result, isLoading, write, error: transactionError } = useContractWrite(config);

  // TODO check for performance issues
  useEffect(() => {
    console.log("UseEffect ran");
    if (transactionError) {
      const message = getParsedEthersError(transactionError);
      setError(message);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  }, [transactionError]);

  const handleWrite = () => {
    if (!write) {
      // TODO Show more descriptive error message
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

  // TODO Handle Error with nice toast, prettify json result
  return (
    <div className="flex flex-col items-start space-y-2 border-b-2 border-black pb-2">
      <p className="text-black my-0">{functionFragment.name}</p>
      {inputs}
      {functionFragment.payable ? <TxValueInput setTxValue={setTxValue} txValue={txValue} /> : null}
      <button className={`btn btn-primary btn-sm ${isLoading && "loading"}`} onClick={handleWrite}>
        Send 💸
      </button>
      <span className="break-all  block">{tryToDisplay(result)}</span>
      {error && <ErrorToast errorMessage={error} />}
    </div>
  );
};
