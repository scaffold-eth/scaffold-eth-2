import { toast as hotToast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/20/solid";

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

// TODO Remove this in future
/**
 * Custom Txn Toast
 */
function TxToast(blockExplorerLink: string) {
  hotToast.custom(
    t => (
      <div
        className={`flex flex-row items-center justify-between max-w-sm bg-white p-4 text-black shadow-2xl hover:shadow-none transform-gpu translate-y-0 hover:translate-y-1 rounded-xl relative transition-all duration-500 ease-in-out${
          t.visible ? "top-0" : "-top-96"
        }`}
      >
        <p className="text-2xl self-start my-0">🎉</p>
        <div className="flex flex-col ml-4 cursor-default">
          <p className="my-0">Mined successfully !</p>
          <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block underline text-md">
            checkout out transaction
          </a>
        </div>
        <div className="absolute top-2 right-2 cursor-pointer text-lg" onClick={() => hotToast.dismiss(t.id)}>
          <XMarkIcon className="w-6 cursor-pointer" onClick={() => hotToast.remove(t.id)} />
        </div>
      </div>
    ),
    {
      duration: 10000000000,
    },
  );
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
  tx: (blockExplorerLink: string) => {
    TxToast(blockExplorerLink);
  },
};

export default toast;
