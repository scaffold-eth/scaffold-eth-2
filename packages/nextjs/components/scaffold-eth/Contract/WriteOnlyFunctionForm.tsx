import { FunctionFragment } from "ethers/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import InputUI from "./InputUI";
import TxReceipt from "./TxReceipt";
import { getFunctionInputKey, getParsedEthersError } from "./utilsContract";
import { TxValueInput } from "./utilsComponents";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { toast, parseTxnValue, getConfiguredChainFromENV } from "~~/utils/scaffold-eth";
import RainbowKitCustomConnectButton from "../RainbowKitCustomConnectButton";

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
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const configuredChain = getConfiguredChainFromENV();
  const writeTxn = useTransactor();

  const keys = Object.keys(form);

  // We are omitting usePrepareContractWrite here to avoid unnecessary RPC calls and wrong gas estimations.
  // See:
  //   - https://github.com/scaffold-eth/se-2/issues/59
  //   - https://github.com/scaffold-eth/se-2/pull/86#issuecomment-1374902738
  const {
    data: result,
    isLoading,
    writeAsync,
  } = useContractWrite({
    address: contractAddress,
    functionName: functionFragment.name,
    abi: [functionFragment],
    args: keys.map(key => form[key]),
    mode: "recklesslyUnprepared",
    overrides: {
      value: txValue ? parseTxnValue(txValue) : undefined,
    },
  });

  const handleWrite = async () => {
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

  const { data: txResult } = useWaitForTransaction({
    hash: result?.hash,
  });

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

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium my-0 break-words">{functionFragment.name}</p>
      {inputs}
      {functionFragment.payable ? <TxValueInput setTxValue={setTxValue} txValue={txValue} /> : null}
      <div className="flex justify-between gap-2">
        <div className="flex-grow">{txResult ? <TxReceipt txResult={txResult} /> : null}</div>
        {isConnected ? (
          <button
            className={`btn btn-secondary btn-sm ${isLoading ? "loading" : ""}`}
            onClick={() => {
              if (chain?.id !== configuredChain.id) {
                toast.error(`Wrong network selected, please switch to ${configuredChain.name}`);
                return;
              }
              handleWrite();
            }}
          >
            Send 💸
          </button>
        ) : (
          <RainbowKitCustomConnectButton />
        )}
      </div>
    </div>
  );
};
