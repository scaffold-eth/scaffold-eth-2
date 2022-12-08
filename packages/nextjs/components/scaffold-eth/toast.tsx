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
function TxToast(message: string, blockExplorerLink?: string, options?: { icon: string }, loading = false) {
  return hotToast.custom(
    t => (
      <div
        className={`flex flex-row items-center justify-between max-w-sm bg-white p-4 text-black shadow-2xl hover:shadow-none transform-gpu translate-y-0 hover:translate-y-1 rounded-xl relative transition-all duration-500 ease-in-out${
          t.visible ? "top-0" : "-top-96"
        }`}
      >
        <p className="text-2xl self-start my-0">
          {loading ? (
            <svg
              aria-hidden="true"
              className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          ) : options?.icon ? (
            options.icon
          ) : (
            ""
          )}
        </p>
        <div className="flex flex-col ml-4 cursor-default">
          <p className="my-0">{message}</p>
          {blockExplorerLink && blockExplorerLink.length > 0 ? (
            <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block underline text-md">
              checkout out transaction
            </a>
          ) : null}
        </div>
        <div className="absolute top-2 right-2 cursor-pointer text-lg" onClick={() => hotToast.dismiss(t.id)}>
          <XMarkIcon className="w-6 cursor-pointer" onClick={() => hotToast.remove(t.id)} />
        </div>
      </div>
    ),
    {
      duration: loading ? Infinity : 3000,
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
  txnSuccess: (message: string, blockExplorerLink: string) => {
    return TxToast(message, blockExplorerLink, { icon: "🎉" });
  },
  txnLoading: (message: string, blockExplorerLink: string) => {
    return TxToast(message, blockExplorerLink, undefined, true);
  },
};

export default toast;
