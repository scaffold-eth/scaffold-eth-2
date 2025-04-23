import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth/useCopyToClipboard";

export const AddressCopyIcon = ({ className, address }: { className?: string; address: string }) => {
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        copyToClipboard(address);
      }}
      type="button"
    >
      {isCopiedToClipboard ? (
        <CheckCircleIcon className={className} aria-hidden="true" />
      ) : (
        <DocumentDuplicateIcon className={className} aria-hidden="true" />
      )}
    </button>
  );
};
