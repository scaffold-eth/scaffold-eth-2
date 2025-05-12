import React, { ReactNode } from "react";

interface ToggleProps {
  isOn: boolean;
  onChange: (isOn: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ isOn, onChange, label, disabled = false, className = "" }) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!isOn);
    }
  };

  return (
    <div className={`flex items-center ${className} gap-3`}>
      <button
        role="switch"
        aria-checked={isOn}
        aria-label={typeof label === "string" ? label : undefined}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
          ${isOn ? "bg-primary" : "bg-gray-200"}
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white
            transition-transform duration-200 ease-in-out
            ${isOn ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
      {label}
    </div>
  );
};
