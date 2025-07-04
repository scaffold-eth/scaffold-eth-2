import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonSize = "xs" | "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  circle?: boolean;
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-6 min-h-6 px-2 text-xs",
  sm: "h-8 min-h-8 px-4 text-sm",
  md: "h-12 min-h-12 px-6 text-base",
  lg: "h-16 min-h-16 px-8 text-lg",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-content hover:bg-primary-shade active:bg-primary/90 shadow-md",
  secondary: "bg-secondary text-secondary-content hover:bg-secondary-shade active:bg-secondary/90 shadow-md",
  ghost: "bg-transparent hover:bg-secondary/50 active:bg-secondary/50 shadow-none",
};

export const Button = ({
  children,
  size = "md",
  variant = "primary",
  className = "",
  type = "button",
  circle = false,
  disabled = false,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "cursor-pointer inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const disabledClass = disabled ? "opacity-50 pointer-events-none cursor-default" : "";
  const circleClass = circle
    ? "aspect-square !p-0 flex items-center justify-center hover:bg-base-200/50 active:bg-base-200 shadow-md"
    : "";
  const buttonClasses =
    `${baseClasses} ${sizeClass} ${variantClass} ${className} ${disabledClass} ${circleClass}`.trim();

  return (
    <button type={type} className={buttonClasses} {...props}>
      {children}
    </button>
  );
};
