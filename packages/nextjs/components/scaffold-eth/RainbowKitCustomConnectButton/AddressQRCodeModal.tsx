import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { Address } from "~~/components/scaffold-eth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";

type AddressQRCodeModalProps = {
  address: AddressType;
  children: React.ReactNode;
};

export const AddressQRCodeModal = ({ address, children }: AddressQRCodeModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Address QR Code</DialogTitle>
        </DialogHeader>
        <DialogDescription className="hidden">Address QR Code</DialogDescription>
        <div className="flex flex-col items-center gap-6 py-6 break-all">
          <QRCodeSVG value={address} size={256} />
          <Address address={address} format="long" disableAddressLink onlyEnsOrAddress />
        </div>
      </DialogContent>
    </Dialog>
  );
};
