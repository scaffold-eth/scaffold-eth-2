import { useAddressInput } from "../AddressInput2/_hooks/useAddressInput";
import { CustomAddressInputPrefix } from "./_components/CustomAddressInputPrefix";
import { CustomAddressInputSuffix } from "./_components/CustomAddressInputSuffix";
import { CustomInputBase } from "./_components/CustomInputBase";
import { Address } from "viem";
import { CommonInputProps } from "~~/components/scaffold-eth";

/**
 * Address input with ENS name resolution
 */
export const CustomAddressInput = ({
  value,
  name,
  placeholder,
  onChange,
  disabled,
}: CommonInputProps<Address | string>) => {
  const { ensAddress, ensName, ensAvatar, isEnsLoadingAddressOrName, reFocus, isEnsAvatarLoading, enteredEnsName } =
    useAddressInput({
      value,
      onChange,
    });

  return (
    <CustomInputBase<Address>
      name={name}
      placeholder={placeholder}
      error={ensAddress === null}
      value={value as Address}
      onChange={onChange}
      disabled={isEnsLoadingAddressOrName || disabled}
      reFocus={reFocus}
      prefix={
        <CustomAddressInputPrefix
          ensName={ensName}
          ensAvatar={ensAvatar}
          isEnsAvatarLoading={isEnsAvatarLoading}
          isEnsLoadingAddressOrName={isEnsLoadingAddressOrName}
          enteredEnsName={enteredEnsName}
        />
      }
      suffix={<CustomAddressInputSuffix value={value as Address} />}
    />
  );
};
