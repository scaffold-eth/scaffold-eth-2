import { toast as hotToast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type toastClassType = "alert-success" | "alert-info" | "alert-warning" | "alert-error";

// ToDo. Implement our custom lib (zustand + tailwind)
/**
 * Fires a Toast
 */
function Toast(message: string, alertClass: toastClassType) {
  hotToast.custom(t => {
    return (
      <div className={`alert ${alertClass} max-w-sm ${t.visible ? "animate-enter" : "animate-leave"}`}>
        {message}
        <XMarkIcon className="w-12 cursor-pointer self-start" onClick={() => hotToast.remove(t.id)} />
      </div>
    );
  });
}

// We need to do write the full class explicitly, so
// the Tailwind compiler knows that we need to include those classes.
const toast = {
  success: (message: string) => {
    Toast(message, "alert-success");
  },
  info: (message: string) => {
    Toast(message, "alert-info");
  },
  warning: (message: string) => {
    Toast(message, "alert-warning");
  },
  error: (message: string) => {
    Toast(message, "alert-error");
  },
};

export default toast;
