import { Address, GetEnsNameReturnType } from "viem";
import { GetEnsAvatarReturnType } from "wagmi/actions";

export const CustomAddressInputPrefix = ({
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
    <div className="flex bg-blue-400 rounded-l-md items-center">
      {isEnsAvatarLoading && <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-md shrink-0"></div>}
      {ensAvatar ? (
        <span className="w-[35px]">
          {
            // eslint-disable-next-line
            <img className="w-md rounded-md" src={ensAvatar} alt={`${ensAddress} avatar`} />
          }
        </span>
      ) : null}
      <span className="px-2">{enteredEnsName ?? ensName}</span>
    </div>
  ) : (
    isEnsLoadingAddressOrName && (
      <div className="flex bg-base-300 rounded-l-md items-center gap-2 pr-2">
        <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-md shrink-0"></div>
        <div className="skeleton bg-base-200 h-3 w-20"></div>
      </div>
    )
  );
};
