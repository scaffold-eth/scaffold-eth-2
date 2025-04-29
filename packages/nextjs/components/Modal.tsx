import { ReactNode, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-lg bg-base-100 p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 cursor-pointer hover:bg-base-300">
          <XMarkIcon className="h-6 w-6" />
        </button>

        {title && <h2 className="mb-4 text-xl font-semibold">{title}</h2>}

        <div className="mt-2 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
