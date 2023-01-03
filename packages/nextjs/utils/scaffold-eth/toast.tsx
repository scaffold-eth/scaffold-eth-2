import React from "react";
import { toast as hotToast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import Spinner from "~~/components/Spinner";

type TPositions = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

type TToastProps = {
  content: React.ReactNode;
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

const ENUM_STATUSES = {
  success: <CheckCircleIcon className="w-7 text-success" />,
  loading: <Spinner />,
  error: <ExclamationCircleIcon className="w-7 text-error" />,
  info: <InformationCircleIcon className="w-7 text-info" />,
  warning: <ExclamationTriangleIcon className="w-7 text-warning" />,
};

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: TPositions = "top-center";

/**
 * Custom Toast
 */
function Toast({ content, status, duration = DEFAULT_DURATION, icon, position = DEFAULT_POSITION }: TToastProps) {
  return hotToast.custom(
    t => (
      <div
        className={`flex flex-row items-center justify-between max-w-sm bg-white p-4 text-black shadow-2xl hover:shadow-none transform-gpu translate-y-0 hover:translate-y-1 rounded-md relative transition-all duration-500 ease-in-out space-x-2 ${
          t.visible ? "top-0" : "-top-96"
        }`}
      >
        <div className="text-2xl self-start mb-0 mt-3">{icon ? icon : ENUM_STATUSES[status]}</div>
        <div className="mt-3 break-all">{content}</div>

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
  success: (content: React.ReactNode, options?: ToastOptions) => {
    return Toast({ content, status: "success", ...options });
  },
  info: (content: React.ReactNode, options?: ToastOptions) => {
    return Toast({ content, status: "info", ...options });
  },
  warning: (content: React.ReactNode, options?: ToastOptions) => {
    return Toast({ content, status: "warning", ...options });
  },
  error: (content: React.ReactNode, options?: ToastOptions) => {
    return Toast({ content, status: "error", ...options });
  },
  loading: (content: React.ReactNode, options?: ToastOptions) => {
    return Toast({ content, status: "loading", ...options });
  },
  remove: (toastId: string) => {
    hotToast.remove(toastId);
  },
};

export default toast;
