import { ChangeEvent, useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useEnsAddress } from "wagmi";

type TAddressInputProps = {
  onChange?: (arg: string) => void;
  placeholder?: string;
  name?: string;
  value?: string;
};

// ToDo:  move this function to an utility file
const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

/**
 * Address input with ENS name resolution
 */
const AddressInput = ({ value, name, placeholder, onChange }: TAddressInputProps) => {
  const [address, setAddress] = useState("");

  const isControlledInput = value !== undefined;

  const { data: ensData, isLoading } = useEnsAddress({
    name: address,
    enabled: isENS(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const onChangeAddress = async (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  useEffect(() => {
    if (!ensData) return;

    // ENS resolved successfully
    setAddress(ensData);
    if (onChange) {
      onChange(ensData);
    }
  }, [ensData, onChange]);

  return (
    <>

      <div className="form-control">
        <label className="input-group">

      <div className="form-control" >
        <label className="input-group input-group-sm" style={{
              width:'auto',
              marginLeft: 'auto',
              marginRight:'auto',
              marginTop:'5vh'
              }}>
          {/* write inline css that will display input in the center of the screen */}

          <input
            name={name}
            type="text"
            placeholder={placeholder}
            className={`input input-bordered ${ensData === null && "input-error"}`}
            value={isControlledInput ? value : address || ""}
            onChange={onChangeAddress}
            disabled={isLoading}
            style={{backgroundColor:'white', color:'black'}}
          />
          <span className="p-0 rounded-md bg-base-100">
            <Blockies seed={address?.toLowerCase() as string} size={9.5} scale={5} />

          </span>
        </label>
      </div>
    </>
  );
};

export default AddressInput;
