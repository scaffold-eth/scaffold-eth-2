import React from "react";
import { CheckmarkIcon, ErrorIcon, toast as hotToast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import Spinner from "~~/components/Spinner";

type TPositions = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

type TToastProps = {
  message: React.ReactNode;
  status: "success" | "info" | "loading" | "error" | "warning";
  duration?: number;
  icon?: string;
  position?: TPositions;
};

type ToastOptions = {
  duration?: number;
  icon?: string;
  position?: TPositions;
};

const hotToastIconStyles: React.CSSProperties = {
  backgroundColor: "#7eaaef",
  marginTop: "0.25rem",
};

const ENUM_STATUSES = {
  success: <CheckmarkIcon style={hotToastIconStyles} />,
  loading: <Spinner />,
  error: <ErrorIcon style={hotToastIconStyles} />,
  info: <InformationCircleIcon className="w-7  text-primary-focus" />,
  warning: <ExclamationTriangleIcon className="w-7 text-primary-focus" />,
};

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: TPositions = "top-center";

/**
 * Custom Toast
 */
function Toast({ message, status, duration = DEFAULT_DURATION, icon, position = DEFAULT_POSITION }: TToastProps) {
  return hotToast.custom(
    t => (
      <div
        className={`flex flex-row items-center justify-between max-w-sm bg-white p-4 text-black shadow-2xl hover:shadow-none transform-gpu translate-y-0 hover:translate-y-1 rounded-xl relative transition-all duration-500 ease-in-out space-x-2 ${
          t.visible ? "top-0" : "-top-96"
        }`}
      >
        <div className="text-2xl self-start mb-0 mt-3">{icon ? icon : ENUM_STATUSES[status]}</div>
        <div className="mt-3 break-all">{message}</div>

        <div className="absolute top-1 right-1 cursor-pointer text-lg" onClick={() => hotToast.dismiss(t.id)}>
          <XMarkIcon className="w-6 cursor-pointer" onClick={() => hotToast.remove(t.id)} />
        </div>
      </div>
    ),
    {
      duration: status === "loading" ? Infinity : duration,
      position,
    },
  );
}

const toast = {
  success: (message: React.ReactNode, options?: ToastOptions) => {
    return Toast({ message, status: "success", ...options });
  },
  info: (message: React.ReactNode, options?: ToastOptions) => {
    return Toast({ message, status: "info", ...options });
  },
  warning: (message: React.ReactNode, options?: ToastOptions) => {
    return Toast({ message, status: "warning", ...options });
  },
  error: (message: React.ReactNode, options?: ToastOptions) => {
    return Toast({ message, status: "error", ...options });
  },
  loading: (message: React.ReactNode, options?: ToastOptions) => {
    return Toast({ message, status: "loading", ...options });
  },
};

export default toast;
