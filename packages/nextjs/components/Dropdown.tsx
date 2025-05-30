import { ReactNode, createContext, useContext, useRef, useState } from "react";
import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type DropdownContextType = {
  closeDropdown: () => void;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

type DropdownProps = {
  triggerContent: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  hideChevron?: boolean;
  onClose?: () => void;
  triggerClassName?: string;
};

export const Dropdown = ({
  triggerContent,
  children,
  align = "left",
  className = "",
  hideChevron = false,
  onClose,
  triggerClassName = "",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setIsOpen(false);
    onClose?.();
  };

  useOutsideClick(dropdownRef, () => {
    closeDropdown();
  });

  return (
    <DropdownContext.Provider value={{ closeDropdown }}>
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        <button
          onClick={() => (!isOpen ? setIsOpen(true) : closeDropdown())}
          className={`flex flex-shrink-0 items-center cursor-pointer gap-1 text-sm font-medium hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary ${triggerClassName}`}
        >
          {triggerContent}
          {!hideChevron && (
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""} mr-3`} />
          )}
        </button>

        {isOpen && (
          <div
            className={`flex flex-col gap-1 absolute mt-3 shadow-accent shadow-center rounded-xl bg-base-200 p-1 ${align === "right" ? "right-0" : "left-0"}`}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
};

type DropdownItemProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  closeOnClick?: boolean;
};

export const DropdownItem = ({ children, onClick, className = "", closeOnClick = true }: DropdownItemProps) => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownItem must be used within a Dropdown component");
  }

  const handleClick = () => {
    onClick?.();
    if (closeOnClick) {
      context.closeDropdown();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-nowrap w-full text-left text-sm ${className}`}
    >
      {children}
    </button>
  );
};
