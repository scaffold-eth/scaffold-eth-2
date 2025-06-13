"use client";

import { ReactNode, useState } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";
type TooltipColor = "primary" | "secondary";

type TooltipProps = {
  children: ReactNode;
  content: string;
  position?: TooltipPosition;
  color?: TooltipColor;
  className?: string;
  disabled?: boolean;
  open?: boolean;
};

export const Tooltip = ({
  children,
  content,
  position = "top",
  color = "secondary",
  disabled = false,
  className = "",
  open = false,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClassNames = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowPositionClassNames = {
    top: "left-1/2 -translate-x-1/2 bottom-full mb-1 z-40",
    bottom: "left-1/2 -translate-x-1/2 top-full mt-1 z-40",
    left: "top-1/2 -translate-y-1/2 right-full mr-1 z-40",
    right: "top-1/2 -translate-y-1/2 left-full ml-1 z-40",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {(isVisible || open) && !disabled && (
        <>
          <div
            className={`absolute w-1.5 h-1.5 ${color === "primary" ? "bg-primary" : "bg-secondary"} transform rotate-45 ${arrowPositionClassNames[position]}`}
          />
          <div
            className={`absolute px-2 py-1 text-sm text-primary-content ${color === "primary" ? "bg-primary" : "bg-secondary"} rounded-full shadow-lg whitespace-nowrap ${positionClassNames[position]} ${className}`}
            role="tooltip"
          >
            {content}
          </div>
        </>
      )}
    </div>
  );
};
