import { useState } from "react";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { NetworkOptions } from "./NetworkOptions";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAddress } from "viem";
import { Address } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);
  const [open, setOpen] = useState(false);

  const [addressCopied, setAddressCopied] = useState(false);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={open ? undefined : setOpen}>
      <DropdownMenuTrigger asChild onClick={() => setOpen(open => !open)}>
        <Button size="sm" variant="secondary">
          <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          <span className="ml-2 mr-1">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onInteractOutside={closeDropdown}
        onEscapeKeyDown={closeDropdown}
        className={open ? "" : "!pointer-events-none"}
      >
        <NetworkOptions hidden={!selectingNetwork} />
        {!selectingNetwork && (
          <>
            <CopyToClipboard
              text={checkSumAddress}
              onCopy={() => {
                setAddressCopied(true);
                setTimeout(() => {
                  setAddressCopied(false);
                }, 800);
              }}
            >
              <DropdownMenuItem asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  {addressCopied ? (
                    <>
                      <CheckCircleIcon
                        className="text-xl font-normal h-6 w-4 cursor-pointer mr-2 ml-2 sm:ml-0"
                        aria-hidden="true"
                      />
                      <span className="whitespace-nowrap">Copied!</span>
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="text-xl font-normal h-6 w-4 mr-2" aria-hidden="true" />
                      <span className="whitespace-nowrap">Copy address</span>
                    </>
                  )}
                </Button>
              </DropdownMenuItem>
            </CopyToClipboard>
            <AddressQRCodeModal address={address}>
              <DropdownMenuItem asChild>
                <Button variant="ghost" size="sm" className="w-full">
                  <div className="flex items-center w-full">
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    <span>View QR Code</span>
                  </div>
                </Button>
              </DropdownMenuItem>
            </AddressQRCodeModal>
            <DropdownMenuItem asChild>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <a target="_blank" href={blockExplorerAddressLink} rel="noopener noreferrer">
                  <ArrowTopRightOnSquareIcon className="mr-2 h-4 w-4" />
                  View on Block Explorer
                </a>
              </Button>
            </DropdownMenuItem>
            {allowedNetworks.length > 1 && (
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectingNetwork(true)}
                >
                  <ArrowsRightLeftIcon className="mr-2 h-4 w-4" />
                  <span>Switch Network</span>
                </Button>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  disconnect();
                  closeDropdown();
                }}
              >
                <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
