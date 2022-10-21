import { ChangeEvent, useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useEnsAddress } from "wagmi";

interface IAddressInput {
  onSuccess?: (arg: string) => void;
  placeholder?: string;
}
// todo:  move this functions to other utility file
const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

/**
 Address input component with ens name resolution
*/

const AddressInput = ({ placeholder, onSuccess }: IAddressInput): any => {
  const [address, setAddress] = useState("");

  const { data: ensData, isLoading } = useEnsAddress({
    name: address,
    enabled: isENS(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const onChangeAddress = async (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  useEffect(() => {
    if (ensData) {
      setAddress(ensData as string);
    }

    if (ensData && onSuccess) {
      onSuccess(ensData as string);
    }
  }, [ensData, onSuccess]);

  return (
    <>
      <div className={`form-control`}>
        <label className="input-group input-group-sm">
          <input
            type="text"
            placeholder={placeholder}
            className={`input input-bordered h-10 ${ensData === null && "input-error"}`}
            value={address || ""}
            onChange={onChangeAddress}
            disabled={isLoading}
          />
          <span className="p-0 rounded-md bg-base-100 h-10">
            <Blockies seed={address?.toLowerCase() as string} size={11} />
          </span>
        </label>
      </div>
    </>
  );
};

export default AddressInput;
