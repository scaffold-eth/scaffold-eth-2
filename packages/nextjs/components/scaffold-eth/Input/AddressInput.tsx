import { useCallback, useEffect, useState } from "react";
import { blo } from "blo";
import { isAddress } from "viem";
import { Address } from "viem";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";
import { useAddressBook } from "~~/hooks/scaffold-eth/useAddressBook";

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

  const [showKnownAddresses, setShowKnownAddresses] = useState<boolean>(false);
  const toggleShowKnownAddresses = () => setShowKnownAddresses(!showKnownAddresses);
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

  const addressBook = useAddressBook();
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
              onClick={toggleShowKnownAddresses}
              data-tip="show known addresses"
            >
              <BookOpenIcon className="h-4 w-4 cursor-pointer" aria-hidden="true" />
            </div>
            {
              // Don't want to use nextJS Image here (and adding remote patterns for the URL)
              // eslint-disable-next-line @next/next/no-img-element
              value && <img alt="" className="!rounded-full" src={blo(value as `0x${string}`)} width="35" height="35" />
            }
          </>
        }
      />
      {showKnownAddresses && (
        <ol className="border-2 border-base-300 bg-base-200 text-accent p-2 mx-4 rounded-md">
          {addressBook.map(({ address, description }, index) => (
            <li
              key={`${address}-${index}`}
              className="flex space-x-4 cursor-pointer"
              onClick={() => {
                toggleShowKnownAddresses();
                handleChange(address);
              }}
            >
              <img
                alt=""
                className="!rounded-full"
                src={blo(address.toLowerCase() as `0x${string}`)}
                width="35"
                height="35"
              />
              <div>{address?.slice(0, 5) + "..." + address?.slice(-4)}</div>
              <div>{description}</div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
};
