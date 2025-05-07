import { useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { QRCodeSVG } from "qrcode.react";
import { getAddress } from "viem";
import { Address as AddressType } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftEndOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Dropdown, DropdownItem } from "~~/components/Dropdown";
import { Modal } from "~~/components/Modal";
import { Address, BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: AddressType;
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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const [selectingNetwork, setSelectingNetwork] = useState(false);

  return (
    <>
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Address QR Code">
        <div className="flex flex-col items-center gap-6 space-y-3 py-6">
          <QRCodeSVG value={address} size={256} />
          <Address address={address} format="long" disableAddressLink onlyEnsOrAddress />
        </div>
      </Modal>
      <Dropdown
        onClose={() => setSelectingNetwork(false)}
        align="right"
        className="bg-secondary rounded-full"
        triggerClassName="rounded-full"
        triggerContent={
          <>
            <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
            <span className="ml-2 mr-1">
              {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
            </span>
          </>
        }
      >
        {selectingNetwork ? <NetworkOptions /> : null}

        <DropdownItem
          className={`h-8 rounded-xl flex gap-3 hover:bg-primary-content/10 py-1.5 px-3 cursor-pointer ${selectingNetwork ? "hidden" : ""}`}
          onClick={() => copyAddressToClipboard(checkSumAddress)}
          closeOnClick={false}
        >
          {isAddressCopiedToClipboard ? (
            <>
              <CheckCircleIcon className="text-xl font-normal h-6 w-4 ml-2 sm:ml-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Copied!</span>
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className="text-xl font-normal h-6 w-4 ml-2 sm:ml-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Copy address</span>
            </>
          )}
        </DropdownItem>

        <DropdownItem
          className={`h-8 rounded-xl! flex gap-3 hover:bg-primary-content/10 py-1.5 px-3 cursor-pointer ${selectingNetwork ? "hidden" : ""}`}
          onClick={() => setIsQrModalOpen(true)}
        >
          <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
          <span className="whitespace-nowrap">View QR Code</span>
        </DropdownItem>

        <DropdownItem
          className={`h-8 rounded-xl! flex gap-3 hover:bg-primary-content/10 py-1.5 px-3 cursor-pointer ${selectingNetwork ? "hidden" : ""}`}
        >
          <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
          <a target="_blank" href={blockExplorerAddressLink} rel="noopener noreferrer" className="whitespace-nowrap">
            View on Block Explorer
          </a>
        </DropdownItem>
        {allowedNetworks.length > 1 ? (
          <DropdownItem
            className={`h-8 rounded-xl! flex gap-3 hover:bg-primary-content/10 py-1.5 px-3 cursor-pointer ${selectingNetwork ? "hidden" : ""}`}
            onClick={() => {
              setSelectingNetwork(true);
            }}
            closeOnClick={false}
          >
            <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span>Switch Network</span>
          </DropdownItem>
        ) : null}
        <DropdownItem
          className={`h-8 rounded-xl! flex gap-3 hover:bg-primary-content/10 py-1.5 px-3 cursor-pointer text-error ${selectingNetwork ? "hidden" : ""}`}
          onClick={() => disconnect()}
        >
          <ArrowLeftEndOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
          <span>Disconnect</span>
        </DropdownItem>
      </Dropdown>
    </>
  );
};
