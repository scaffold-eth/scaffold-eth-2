import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { DocumentDuplicateIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useEnsName } from "wagmi";

const blockExplorerLink = (address: string, blockExplorer?: string) =>
  `${blockExplorer || "https://etherscan.io/"}address/${address}`;

type TAddressProps = {
  address: string;
  blockExplorer?: string;
  disableAddressLink?: boolean;
  fontSize?: number;
  format?: "short" | "long";
  minimized?: boolean;
};

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export default function Address({
  address,
  blockExplorer,
  disableAddressLink,
  fontSize,
  format,
  minimized,
}: TAddressProps) {
  const [ens, setEns] = useState<string | null>();
  const [addressCopied, setAddressCopied] = useState(false);

  const { data: fetchedEns } = useEnsName({ address, chainId: 1 });

  // We need to apply this pattern to avoid Hydration errors.
  useEffect(() => {
    setEns(fetchedEns);
  }, [fetchedEns]);

  const explorerLink = blockExplorerLink(address, blockExplorer);
  let displayAddress = address?.slice(0, 5) + "..." + address?.slice(-4);

  if (ens) {
    displayAddress = ens;
  } else if (format === "long") {
    displayAddress = address;
  }

  // Skeleton UI
  if (!address) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (minimized) {
    return (
      <a target="_blank" href={explorerLink} rel="noopener noreferrer">
        <Blockies className="inline rounded-md" size={8} scale={2} seed={address.toLowerCase()} />
      </a>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Blockies
          className="mx-auto rounded-md"
          size={5}
          seed={address.toLowerCase()}
          scale={fontSize ? fontSize / 7 : 4}
        />
      </div>
      {disableAddressLink ? (
        <span className="ml-1.5 text-lg font-normal">{displayAddress}</span>
      ) : (
        <a className="ml-1.5 text-lg font-normal" target="_blank" href={explorerLink} rel="noopener noreferrer">
          {displayAddress}
        </a>
      )}
      {addressCopied ? (
        <CheckCircleIcon
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
          aria-hidden="true"
        />
      ) : (
        <CopyToClipboard
          text={address}
          onCopy={() => {
            setAddressCopied(true);
            setTimeout(() => {
              setAddressCopied(false);
            }, 800);
          }}
        >
          <DocumentDuplicateIcon
            className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
            aria-hidden="true"
          />
        </CopyToClipboard>
      )}
    </div>
  );
}
