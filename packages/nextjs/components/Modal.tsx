import { ReactNode, useRef } from "react";
import { Button } from "./Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOutsideClick(modalRef, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-lg bg-base-100 p-6 shadow-xl">
        <Button variant="ghost" size="sm" circle onClick={onClose} className="absolute right-4 top-4">
          <XMarkIcon className="h-6 w-6" />
        </Button>

        {title && <h2 className="mb-4 text-xl font-semibold">{title}</h2>}

        <div className="mt-2 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
