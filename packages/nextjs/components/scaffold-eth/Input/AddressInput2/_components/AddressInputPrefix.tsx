import { Address, GetEnsNameReturnType } from "viem";
import { GetEnsAvatarReturnType } from "wagmi/actions";

export const AddressInputPrefix = ({
  ensName,
  ensAvatar,
  isEnsAvatarLoading,
  isEnsLoadingAddressOrName,
  enteredEnsName,
  ensAddress,
}: {
  ensName?: GetEnsNameReturnType;
  ensAvatar?: GetEnsAvatarReturnType;
  ensAddress?: Address;
  isEnsAvatarLoading: boolean;
  isEnsLoadingAddressOrName: boolean;
  enteredEnsName?: string;
}) => {
  return ensName ? (
    <div className="flex bg-base-300 rounded-l-full items-center">
      {isEnsAvatarLoading && <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full shrink-0"></div>}
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
  ) : (
    isEnsLoadingAddressOrName && (
      <div className="flex bg-base-300 rounded-l-full items-center gap-2 pr-2">
        <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full shrink-0"></div>
        <div className="skeleton bg-base-200 h-3 w-20"></div>
      </div>
    )
  );
};
