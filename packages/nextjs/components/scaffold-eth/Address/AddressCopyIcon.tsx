import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/components/Button";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth/useCopyToClipboard";

export const AddressCopyIcon = ({ className, address }: { className?: string; address: string }) => {
  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();

  return (
    <Button
      variant="ghost"
      size="xs"
      circle
      onClick={e => {
        e.stopPropagation();
        copyAddressToClipboard(address);
      }}
    >
      {isAddressCopiedToClipboard ? (
        <CheckCircleIcon className={className} aria-hidden="true" />
      ) : (
        <DocumentDuplicateIcon className={className} aria-hidden="true" />
      )}
    </Button>
  );
};
