import { useCallback, useEffect, useState } from "react";
import Blockies from "react-blockies";
import { isAddress } from "viem";
import { Address } from "viem";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

// ToDo:  move this function to an utility file
const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: value,
    enabled: isENS(value),
    chainId: 1,
    cacheTime: 30_000,
  });

  const [showPopularAddresses, setShowPopularAddresses] = useState<boolean>(false);
  const toggleShowPopularAddresses = () => setShowPopularAddresses(!showPopularAddresses);
  const [enteredEnsName, setEnteredEnsName] = useState<string>();
  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: value,
    enabled: isAddress(value),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    enabled: Boolean(ensName),
    chainId: 1,
    cacheTime: 30_000,
  });

  // ens => address
  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setEnteredEnsName(value);
    onChange(ensAddress);
  }, [ensAddress, onChange, value]);

  const handleChange = useCallback(
    (newValue: Address) => {
      setEnteredEnsName(undefined);
      onChange(newValue);
    },
    [onChange],
  );

  const popularAddresses = [
    { description: "addr1", address: "0x04cd158190d83ef7e50d181c44aafdb181a621b2" },
    { description: "addr2", address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" },
  ];

  return (
    <>
      <InputBase<Address>
        name={name}
        placeholder={placeholder}
        error={ensAddress === null}
        value={value}
        onChange={handleChange}
        disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
        prefix={
          ensName && (
            <div className="flex bg-base-300 rounded-l-full items-center">
              {ensAvatar ? (
                <span className="w-[35px]">
                  {
                    // eslint-disable-next-line
                    <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />
                  }
                </span>
              ) : null}
              <span className="text-accent px-2">{enteredEnsName ?? ensName}</span>
            </div>
          )
        }
        suffix={
          <>
            <div
              className="self-center cursor-pointer text-xl font-semibold px-4 text-accent tooltip tooltip-top tooltip-secondary before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
              onClick={toggleShowPopularAddresses}
              data-tip="popular addresses"
            >
              <BookOpenIcon className="h-4 w-4 cursor-pointer" aria-hidden="true" />
            </div>
            {value && <Blockies className="!rounded-full" seed={value?.toLowerCase() as string} size={7} scale={5} />}
          </>
        }
      />
      {showPopularAddresses && (
        <ol className="border-2 border-base-300 bg-base-200 text-accent p-2 mx-4 rounded-md">
          {popularAddresses.map(({ address, description }) => (
            <li key={address} className="flex space-x-4 cursor-pointer" onClick={() => handleChange(address)}>
              <Blockies className="!rounded-full" seed={address} size={7} scale={3} />
              <div>{description}</div>
              <div>{address?.slice(0, 5) + "..." + address?.slice(-4)}</div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
};
