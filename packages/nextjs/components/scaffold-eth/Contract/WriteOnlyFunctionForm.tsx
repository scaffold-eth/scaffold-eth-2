import { FunctionFragment } from "ethers/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { tryToDisplay } from "./utilsDisplay";
import InputUI from "./InputUI";
import { getFunctionInputKey, getParsedEthersError } from "./utilsContract";
import { TxValueInput } from "./utilsComponents";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { toast } from "~~/utils/scaffold-eth";

// TODO set sensible initial state values to avoid error on first render, also put it in utilsContract
const getInitialFormState = (functionFragment: FunctionFragment) => {
  const initialForm: Record<string, any> = {};
  functionFragment.inputs.forEach((input, inputIndex) => {
    const key = getFunctionInputKey(functionFragment, input, inputIndex);
    initialForm[key] = "";
  });
  return initialForm;
};

type TWriteOnlyFunctionFormProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
  setRefreshDisplayVariables: Dispatch<SetStateAction<boolean>>;
};

export const WriteOnlyFunctionForm = ({
  functionFragment,
  contractAddress,
  setRefreshDisplayVariables,
}: TWriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(functionFragment));
  const [txValue, setTxValue] = useState("");
  const writeTxn = useTransactor();

  const keys = Object.keys(form);

  // TODO handle gasPrice
  const { config, error: inputError } = usePrepareContractWrite({
    addressOrName: contractAddress,
    functionName: functionFragment.name,
    contractInterface: [functionFragment],
    args: keys.map(key => form[key]),
    overrides: {
      value: txValue,
    },
  });

  const {
    data: result,
    isLoading,
    writeAsync,
  } = useContractWrite({
    ...config,
  });

  const handleWrite = async () => {
    // TODO Show more descriptive error message
    if (inputError) {
      const message = getParsedEthersError(inputError);
      toast.error(message);
    }

    if (writeAsync && writeTxn) {
      try {
        await writeTxn(writeAsync());
        setRefreshDisplayVariables(prevState => !prevState);
      } catch (e: any) {
        const message = getParsedEthersError(e);
        toast.error(message);
      }
    }
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

  // TODO prettify json result
  return (
    <div className="flex flex-col items-start space-y-2 border-b-2 border-black pb-2">
      <p className="text-black my-0">{functionFragment.name}</p>
      {inputs}
      {functionFragment.payable ? <TxValueInput setTxValue={setTxValue} txValue={txValue} /> : null}
      <button className={`btn btn-primary btn-sm ${isLoading && "loading"}`} onClick={handleWrite}>
        Send 💸
      </button>
      <span className="break-all block">{tryToDisplay(result)}</span>
    </div>
  );
};
