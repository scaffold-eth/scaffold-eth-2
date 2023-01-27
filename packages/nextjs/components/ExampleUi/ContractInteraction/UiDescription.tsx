import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export const UiDescription = () => {
  const [visible, setVisible] = useState(true);
  return (
    <div className={`mt-7 flex gap-2 ${visible ? "" : "invisible"}`}>
      <div className="flex gap-5 bg-base-200 opacity-80 p-7 rounded-2xl shadow-lg">
        <span className="text-3xl">👋🏻</span>
        <span>
          This is Example UI, in this page you can see how some of our components work, and how you can bring them to
          life with your own design! Have fun and try it out!
        </span>
      </div>
      <button
        className="btn btn-circle btn-ghost h-6 w-6 bg-base-200 opacity-80 min-h-0 drop-shadow-md"
        onClick={() => setVisible(false)}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
