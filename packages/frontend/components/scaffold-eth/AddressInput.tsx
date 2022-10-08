import { ChangeEvent, useCallback, useEffect } from "react";
import Blockies from "react-blockies";
import { useEnsAddress } from "wagmi";

interface IAddressInput {
  value?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (arg: string) => void;
  placeholder?: string;
  wrapperClasses?: string;
}
// can we move this functions to other utility file ?
const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

export const Sleep = async (time: number): Promise<any> =>
  new Promise(resolve => setTimeout(() => resolve(true), time));

const AddressInput = ({ value, onChange, placeholder, wrapperClasses }: IAddressInput): any => {
  const { data: ensData, isLoading } = useEnsAddress({
    name: isENS(value) ? value : "",
  });

  const onChangeAddress = async (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  //   load an address from ens name
  const loadEnsAddress = useCallback(async () => {
    if (ensData && onChange) {
      await Sleep(100);
      onChange(ensData);
    }

    if (ensData === null && onChange) {
      await Sleep(100);
      onChange("");
    }
  }, [ensData, onChange]);

  useEffect(() => {
    loadEnsAddress();
  }, [ensData, onChange, loadEnsAddress]);

  return (
    <>
      <div className={`form-control ${wrapperClasses}`}>
        <label className="input-group input-group-sm">
          <input
            type="text"
            placeholder={placeholder}
            className="input input-bordered h-10 "
            value={value}
            onChange={onChangeAddress}
            disabled={isLoading}
          />

          <span className="p-0 rounded-md bg-base-100 h-10 ">
            <Blockies seed={value?.toLowerCase() as string} size={11} />
          </span>
        </label>
      </div>
    </>
  );
};

export default AddressInput;
