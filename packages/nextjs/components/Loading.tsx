type LoadingProps = {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};

const sizeMap = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-7 h-7",
  xl: "w-8 h-8",
};

export function Loading({ className = "", size = "md" }: LoadingProps) {
  return (
    <svg
      className={`${className} ${sizeMap[size]}`}
      width="24"
      height="24"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform-origin="center">
        <circle
          cx="12"
          cy="12"
          r="9.5"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="42 150"
          strokeDashoffset="-16"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}
