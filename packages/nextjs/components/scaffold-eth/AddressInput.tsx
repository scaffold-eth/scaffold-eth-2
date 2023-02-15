import { ChangeEvent, useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { isAddress } from "ethers/lib/utils";

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
  const [resolvedEns, setResolvedEns] = useState("");

  // Controlled vs Uncontrolled input.
  const currentValue = value !== undefined ? value : address || "";

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: address,
    enabled: isENS(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address,
    enabled: isAddress(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatar } = useEnsAvatar({
    address,
    enabled: isAddress(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const isLoading = isEnsAddressLoading || isEnsNameLoading;

  useEffect(() => {
    // Reset when clearing controlled input
    if (!currentValue) {
      setResolvedEns("");
      setAddress("");
    }
  }, [currentValue]);

  // ens => address
  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setResolvedEns(address);
    setAddress(ensAddress);
    if (onChange) {
      onChange(ensAddress);
    }
    // We don't want to run it on address change
    // eslint-disable-next-line
  }, [ensAddress, onChange]);

  // address => ens
  useEffect(() => {
    if (!ensName || resolvedEns) return;

    setResolvedEns(ensName);
  }, [ensName, resolvedEns]);

  const onChangeAddress = async (event: ChangeEvent<HTMLInputElement>) => {
    setResolvedEns("");
    setAddress(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className="rounded-full border-2 border-base-300 bg-base-200">
      <div className="form-control grow">
        <div className="flex w-full">
          {resolvedEns && (
            <div className="flex bg-base-300 rounded-l-full items-center">
              <span className={ensAvatar ? "w-[35px]" : ""}>
                {ensAvatar && (
                  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
                  // eslint-disable-next-line
                  <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />
                )}
              </span>
              <span className="text-accent px-2">{resolvedEns}</span>
            </div>
          )}
          <input
            name={name}
            type="text"
            placeholder={placeholder}
            className={`input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow ${
              ensAddress === null ? "input-error" : ""
            }`}
            value={currentValue}
            onChange={onChangeAddress}
            disabled={isLoading}
          />
          {address && <Blockies className="!rounded-full" seed={address?.toLowerCase() as string} size={7} scale={5} />}
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
