import { useState } from "react";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

export const AddressCopyIcon = ({ className, address }: { className?: string; address: string }) => {
  const [addressCopied, setAddressCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setAddressCopied(true);
      setTimeout(() => {
        setAddressCopied(false);
      }, 800);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        handleCopy();
      }}
      type="button"
    >
      {addressCopied ? (
        <CheckCircleIcon className={className} aria-hidden="true" />
      ) : (
        <DocumentDuplicateIcon className={className} aria-hidden="true" />
      )}
    </button>
  );
};
